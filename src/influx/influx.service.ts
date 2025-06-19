import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  // NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  InfluxDB,
  QueryApi,
  WriteApi,
  Point,
} from '@influxdata/influxdb-client';
import { AccesspointsService } from '../accesspoints/accesspoints.service';

@Injectable()
export class InfluxService {
  private readonly writeApi: WriteApi;
  private readonly queryApi: QueryApi;
  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => AccesspointsService))
    private readonly accesspointsService: AccesspointsService,
  ) {
    const url = this.configService.get<string>('INFLUX_URL');
    const token = this.configService.get<string>('INFLUX_TOKEN');
    const org = this.configService.get<string>('INFLUX_ORG');
    const bucket = this.configService.get<string>('INFLUX_BUCKET');

    if (!url || !token || !org || !bucket) {
      throw new Error('InfluxDB configuration is missing');
    }

    const influxDB = new InfluxDB({ url, token });
    this.writeApi = influxDB.getWriteApi(org, bucket);
    this.queryApi = influxDB.getQueryApi(org);
  }

  async writePoint(
    measurement: string,
    fields: Record<string, any>,
    tags?: Record<string, string>,
    timestamp?: Date,
  ): Promise<void> {
    const point = new Point(measurement);
    if (tags) {
      Object.entries(tags).forEach(([key, value]) => point.tag(key, value));
    }
    Object.entries(fields).forEach(([key, value]) =>
      point.intField(key, value),
    );

    if (timestamp) {
      point.timestamp(timestamp);
    }
    try {
      this.writeApi.writePoint(point);
      return await this.writeApi.flush();
    } catch (error) {
      console.error('Error writing point to InfluxDB:', error);
      throw new Error('Failed to write point to InfluxDB');
    }
  }

  // Example query method
  async queryApLog(mac: string, period?: string) {
    if (!mac) {
      throw new ForbiddenException(
        'MAC address is required to query last point',
      );
    }
    // if (!(await this.accesspointsService.existRadMac(mac))) {
    //   throw new NotFoundException(
    //     'Access point with this MAC address does not exist',
    //   );
    // }

    // |> last() for last point
    // |> group(columns: ["mac_address"]) for grouping by mac_address
    const query = `from(bucket: "${this.configService.get<string>('INFLUX_BUCKET')}")
			|> range(start: -${period || '1h'})
			|> filter(fn: (r) => r._measurement == "ap_metrics")
			|> filter(fn: (r) => r.mac_address == "${mac}")
			|> pivot(rowKey:["_time", "mac_address"], columnKey: ["_field"], valueColumn: "_value")
			|> keep(columns: ["_time", "client-2.4", "client-5", "rx", "tx"])`;

    try {
      const result = await this.queryApi.collectRows(query);
      return result || null; // Return the last point or null if no points found
    } catch (error) {
      console.error('Error querying log from InfluxDB:', error);
      throw new Error('Failed to query last point from InfluxDB');
    }
  }

  async queryApLastPoint() {
    const query = `from(bucket: "${this.configService.get<string>('INFLUX_BUCKET')}")
			|> range(start: -1h)
			|> filter(fn: (r) => r._measurement == "ap_metrics")
			|> last()
			|> group(columns: ["mac_address"], mode: "by")
			|> pivot(rowKey:["_time", "mac_address"], columnKey: ["_field"], valueColumn: "_value")`;

    try {
      const result = await this.queryApi.collectRows(query);
      return result || null; // Return the last point or null if no points found
    } catch (error) {
      console.error('Error querying last point from InfluxDB:', error);
      throw new Error('Failed to query last point from InfluxDB');
    }
  }
}

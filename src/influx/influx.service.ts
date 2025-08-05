import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  // NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  InfluxDB,
  QueryApi,
  WriteApi,
  Point,
} from '@influxdata/influxdb-client';
import { Metrics } from 'src/shared/types/snmp-metrics';
import * as snmp from 'net-snmp';
import { ConfigurationsService } from 'src/configurations/configurations.service';

@Injectable()
export class InfluxService {
  private readonly writeApi: WriteApi;
  private readonly queryApi: QueryApi;
  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => ConfigurationsService))
    private readonly configurationsService: ConfigurationsService,
  ) {
    const url = this.configService.get<string>('INFLUX_URL');
    const token = this.configService.get<string>('INFLUX_TOKEN');
    const org = this.configService.get<string>('INFLUX_ORG');
    const bucket = this.configService.get<string>('INFLUX_BUCKET');

    if (!url || !token || !org || !bucket) {
      throw new Error('InfluxDB configuration is missing');
    }

    const influxDB = new InfluxDB({ url, token });
    this.writeApi = influxDB.getWriteApi(org, bucket, 'ms');
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
    Object.entries(fields).forEach(([key, value]) => {
      if (key === 'ip') point.stringField(key, value);
      else point.intField(key, value);
    });

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

  async writePoints(
    measurement: string,
    wlc: string,
    data: Map<string, Record<string, unknown>>,
  ) {
    const points: Point[] = [];
    for (const [key, metrics] of data.entries()) {
      try {
        const { apId, ipId, locationId, ...res } = metrics as {
          apId?: number;
          ipId?: number;
          locationId?: number;
        } & Record<string, Metrics>;
        const point = new Point(measurement).tag('wlc', wlc);
        if (apId) point.tag('apId', apId.toString());
        if (ipId) point.tag('ipId', ipId.toString());
        if (locationId) point.tag('locationId', locationId.toString());

        // iterate on others keys
        for (const [name, metric] of Object.entries(res)) {
          if (
            metric.type === snmp.ObjectType.Counter ||
            metric.type === snmp.ObjectType.Counter32 ||
            metric.type === snmp.ObjectType.Counter64 ||
            metric.type === snmp.ObjectType.Gauge ||
            metric.type === snmp.ObjectType.Gauge32 ||
            metric.type === snmp.ObjectType.Integer ||
            metric.type === snmp.ObjectType.Integer32
          ) {
            point.intField(name, metric.value);
          } else if (
            metric.type === snmp.ObjectType.TimeTicks ||
            metric.type === snmp.ObjectType.Unsigned32
          ) {
            point.uintField(name, metric.value);
          } else if (metric.type === snmp.ObjectType.Boolean) {
            point.booleanField(name, metric.value);
          } else if (metric.type === snmp.ObjectType.BitString) {
            // value as binary string
            point.stringField(
              name,
              Buffer.from(metric.value as string, 'binary').toString('binary'),
            );
          } else if (
            metric.type === snmp.ObjectType.OctetString ||
            metric.type === snmp.ObjectType.Opaque
          ) {
            // value as hex string
            point.stringField(
              name,
              Buffer.from(metric.value as string, 'hex').toString('hex'),
            );
          } else if (
            metric.type === snmp.ObjectType.IpAddress ||
            metric.type === snmp.ObjectType.OID
          ) {
            point.stringField(name, metric.value as string);
          } else continue; // skip unsupported types or unrecognized types
        }
        points.push(point);
      } catch (error) {
        console.error(
          `Error processing metrics for Key ${key}:`,
          metrics,
          error,
        );
        // Optionally, you can throw an error or handle it as needed
      }
    }

    try {
      this.writeApi.writePoints(points);
      return await this.writeApi.flush();
    } catch (error) {
      console.error('Error writing point to InfluxDB:', error);
      throw new Error('Failed to write point to InfluxDB');
    }
  }

  async queryApLog(mac: string, period?: string) {
    if (!mac) {
      throw new ForbiddenException(
        'MAC address is required to query last point',
      );
    }

    const query = `import "internal/debug"
			from(bucket: "${this.configService.get<string>('INFLUX_BUCKET')}")
				|> range(start: -${period || '1d'})
				|> filter(fn: (r) => r._measurement == "ap_metrics")
				|> filter(fn: (r) => r.mac_address == "${mac}")
				|> pivot(rowKey:["_time", "mac_address"], columnKey: ["_field"], valueColumn: "_value")
				|> map(fn: (r) => ({
						r with
							tx         : if exists r.tx then r.tx else debug.null(type: "int"),
							rx         : if exists r.rx then r.rx else debug.null(type: "int"),
							"client-2.4"  : if exists r["client-2.4"] then r["client-2.4"] else debug.null(type: "int"),
							"client-5"   : if exists r["client-5"] then r["client-5"] else debug.null(type: "int"),
							"client-6"   : if exists r["client-6"] then r["client-6"] else debug.null(type: "int")
						}))
				|> keep(columns: ["_time", "client-2.4", "client-5", "client-6", "rx", "tx"])`;

    try {
      const result = await this.queryApi.collectRows(query);
      return result || null; // Return the last point or null if no points found
    } catch (error) {
      console.error('Error querying log from InfluxDB:', error);
      throw new Error('Failed to query last point from InfluxDB');
    }
  }

  async queryApLastPoint() {
    const query = `import "internal/debug"
			from(bucket: "${this.configService.get<string>('INFLUX_BUCKET')}")
				|> range(start: -5m)
				|> filter(fn: (r) => r._measurement == "ap_metrics")
				|> last()
				|> group(columns: ["ap_id"], mode: "by")
				|> pivot(
							rowKey:["_time", "mac_address", "ip_address", "ap_id", "entity_id", "building_id", "section_id"],
							columnKey: ["_field"],
							valueColumn: "_value"
						)
				|> map(fn: (r) => ({
					r with
						tx         : if exists r.tx then r.tx else debug.null(type: "int"),
						rx         : if exists r.rx then r.rx else debug.null(type: "int"),
						"client-2.4"  : if exists r["client-2.4"] then r["client-2.4"] else debug.null(type: "int"),
						"client-5"   : if exists r["client-5"] then r["client-5"] else debug.null(type: "int"),
						"client-6"   : if exists r["client-6"] then r["client-6"] else debug.null(type: "int")
					}))
				|> sort(columns: ["ap_id"])`;

    try {
      const result = await this.queryApi.collectRows(query);
      return result || null; // Return the last point or null if no points found
    } catch (error) {
      console.error('Error querying last point from InfluxDB:', error);
      throw new Error('Failed to query last point from InfluxDB');
    }
  }

  async queryIpLog() {
    const query = `import "internal/debug"
			from(bucket: "${this.configService.get<string>('INFLUX_BUCKET')}")
				|> range(start: -1h)
				|> filter(fn: (r) => r._measurement == "ap_metrics")
				|> filter(fn: (r) => r._field == "client-6")
				|> unique(column: "ip_address")
				|> last()
				|> keep(columns: ["ip_address", "mac_address"])
				|> sort(columns: ["ip_address"])
				`;

    try {
      const result = await this.queryApi.collectRows(query);
      return result || null; // Return the last point or null if no points found
    } catch (error) {
      console.error('Error querying last point from InfluxDB:', error);
      throw new Error('Failed to query last point from InfluxDB');
    }
  }

  // async findOneAp(
  //   sectionId: number,
  //   entityId: number,
  //   buildingId: number,
  //   apId: number,
  // ) {
  //   const query = `import "internal/debug"
  // 		from(bucket: "${this.configService.get<string>('INFLUX_BUCKET')}")
  // 			|> range(start: -5m)
  // 			|> filter(fn: (r) => r._measurement == "ap_metrics")
  // 			|> filter(fn: (r) => r.ap_id == "${apId}" and r.entity_id == "${entityId}"
  // 				and r.building_id == "${buildingId}" and r.section_id == "${sectionId}")
  // 			|> last()
  // 			|> group(columns: ["mac_address"], mode: "by")
  // 			|> pivot(
  // 						rowKey:["_time", "mac_address"],
  // 						columnKey: ["_field"],
  // 						valueColumn: "_value"
  // 					)
  // 			|> map(fn: (r) => ({
  // 				r with
  // 					tx         : if exists r.tx then r.tx else debug.null(type: "int"),
  // 					rx         : if exists r.rx then r.rx else debug.null(type: "int"),
  // 					"client-2.4"  : if exists r["client-2.4"] then r["client-2.4"] else debug.null(type: "int"),
  // 					"client-5"   : if exists r["client-5"] then r["client-5"] else debug.null(type: "int"),
  // 					"client-6"   : if exists r["client-6"] then r["client-6"] else debug.null(type: "int")
  // 				}))`;

  //   try {
  //     const result = await this.queryApi.collectRows(query);
  //     return result || null; // Return the last point or null if no points found
  //   } catch (error) {
  //     console.error('Error querying last point from InfluxDB:', error);
  //     throw new Error('Failed to query last point from InfluxDB');
  //   }
  // }

  // async findOneBuilding(
  //   sectionId: number,
  //   entityId: number,
  //   buildingId: number,
  // ) {
  //   const query = `import "internal/debug"
  // 		from(bucket: "${this.configService.get<string>('INFLUX_BUCKET')}")
  // 			|> range(start: -5m)
  // 			|> filter(fn: (r) => r._measurement == "ap_metrics")
  // 			|> filter(fn: (r) => r.entity_id == "${entityId}" and r.building_id == "${buildingId}"
  // 				and r.section_id == "${sectionId}")
  // 			|> last()
  // 			|> group(columns: ["_field"], mode: "by")
  // 			|> sum()
  // 			|> group(columns: ["result"], mode: "by")
  // 			|> pivot(
  // 						rowKey:[],
  // 						columnKey: ["_field"],
  // 						valueColumn: "_value"
  // 					)
  // 			|> map(fn: (r) => ({
  // 				r with
  // 					tx         : if exists r.tx then r.tx else debug.null(type: "int"),
  // 					rx         : if exists r.rx then r.rx else debug.null(type: "int"),
  // 					"client-2.4"  : if exists r["client-2.4"] then r["client-2.4"] else debug.null(type: "int"),
  // 					"client-5"   : if exists r["client-5"] then r["client-5"] else debug.null(type: "int"),
  // 					"client-6"   : if exists r["client-6"] then r["client-6"] else debug.null(type: "int")
  // 				}))`;

  //   try {
  //     const result = await this.queryApi.collectRows(query);
  //     return result || null; // Return the last point or null if no points found
  //   } catch (error) {
  //     console.error('Error querying last point from InfluxDB:', error);
  //     throw new Error('Failed to query last point from InfluxDB');
  //   }
  // }

  // async findOneEntity(sectionId: number, entityId: number) {
  //   const query = `import "internal/debug"
  // 		from(bucket: "${this.configService.get<string>('INFLUX_BUCKET')}")
  // 			|> range(start: -5m)
  // 			|> filter(fn: (r) => r._measurement == "ap_metrics")
  // 			|> filter(fn: (r) => r.entity_id == "${entityId}" and r.section_id == "${sectionId}")
  // 			|> last()
  // 			|> group(columns: ["_field"], mode: "by")
  // 			|> sum()
  // 			|> group(columns: ["result"], mode: "by")
  // 			|> pivot(
  // 						rowKey:[],
  // 						columnKey: ["_field"],
  // 						valueColumn: "_value"
  // 					)
  // 			|> map(fn: (r) => ({
  // 				r with
  // 					tx         : if exists r.tx then r.tx else debug.null(type: "int"),
  // 					rx         : if exists r.rx then r.rx else debug.null(type: "int"),
  // 					"client-2.4"  : if exists r["client-2.4"] then r["client-2.4"] else debug.null(type: "int"),
  // 					"client-5"   : if exists r["client-5"] then r["client-5"] else debug.null(type: "int"),
  // 					"client-6"   : if exists r["client-6"] then r["client-6"] else debug.null(type: "int")
  // 				}))`;

  //   try {
  //     const result = await this.queryApi.collectRows(query);
  //     return result || null; // Return the last point or null if no points found
  //   } catch (error) {
  //     console.error('Error querying last point from InfluxDB:', error);
  //     throw new Error('Failed to query last point from InfluxDB');
  //   }
  // }

  // async findOneSection(sectionId: number) {
  //   const query = `import "internal/debug"
  // 		from(bucket: "${this.configService.get<string>('INFLUX_BUCKET')}")
  // 			|> range(start: -5m)
  // 			|> filter(fn: (r) => r._measurement == "ap_metrics")
  // 			|> filter(fn: (r) => r.section_id == "${sectionId}")
  // 			|> last()
  // 			|> group(columns: ["entity_id", "_field"], mode: "by")
  // 			|> sum()
  // 			// |> group(columns: ["result"], mode: "by")
  // 			|> pivot(
  // 						rowKey:[],
  // 						columnKey: ["_field"],
  // 						valueColumn: "_value"
  // 					)
  // 			|> map(fn: (r) => ({
  // 				r with
  // 					tx         : if exists r.tx then r.tx else debug.null(type: "int"),
  // 					rx         : if exists r.rx then r.rx else debug.null(type: "int"),
  // 					"client-2.4"  : if exists r["client-2.4"] then r["client-2.4"] else debug.null(type: "int"),
  // 					"client-5"   : if exists r["client-5"] then r["client-5"] else debug.null(type: "int"),
  // 					"client-6"   : if exists r["client-6"] then r["client-6"] else debug.null(type: "int")
  // 				}))`;

  //   try {
  //     const result = await this.queryApi.collectRows(query);
  //     return result || null; // Return the last point or null if no points found
  //   } catch (error) {
  //     console.error('Error querying last point from InfluxDB:', error);
  //     throw new Error('Failed to query last point from InfluxDB');
  //   }
  // }

  async queryConfigGraph(
    sec: number,
    entity: number,
    build: number,
    loc: number,
    period?: string,
  ) {
    if (!sec || !entity || !build || !loc) {
      throw new ForbiddenException(
        'Section, entity, building, and location IDs are required to query configuration graph',
      );
    }
    if (!(await this.configurationsService.isExist(sec, entity, build, loc))) {
      throw new NotFoundException(
        `Configuration for section ${sec}, entity ${entity}, building ${build}, and location ${loc} does not exist`,
      );
    }
    const query = `import "internal/debug"
		from(bucket: "${this.configService.get<string>('INFLUX_BUCKET')}")
			|> range(start: ${period || '-3h'})
			|> filter(fn: (r) => r._measurement == "ap_metrics")
			|> filter(fn: (r) => r.locationId == "${loc}")
			|> group(columns: ["_field"], mode: "by")
			|> pivot(
						rowKey:["apId", "ipId", "locationId", "wlc", "_time"],
						columnKey: ["_field"],
						valueColumn: "_value"
					)
			|> map(fn: (r) => ({
				r with
					tx         : if exists r.tx then r.tx else debug.null(type: "int"),
					rx         : if exists r.rx then r.rx else debug.null(type: "int"),
					"client24"  : if exists r["client24"] then r["client24"] else debug.null(type: "int"),
					"client5"   : if exists r["client5"] then r["client5"] else debug.null(type: "int"),
					"client6"   : if exists r["client6"] then r["client6"] else debug.null(type: "int")
				}))
			|> drop(columns: ["_start", "_stop"])`;

    try {
      const result = await this.queryApi.collectRows(query);
      return result || null; // Return the last point or null if no points found
    } catch (error) {
      console.error('Error querying last point from InfluxDB:', error);
      throw new Error('Failed to query last point from InfluxDB');
    }
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { AccesspointsService } from './accesspoints.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Accesspoint } from './entities/accesspoint.entity';

@ApiTags('Accesspoint')
@Controller('accesspoints')
export class AccesspointsController {
  constructor(private readonly accesspointsService: AccesspointsService) {}

  @Get(':apid')
  @ApiOperation({
    summary: 'Get access point by ID',
  })
  @ApiParam({
    name: 'apid',
    description: 'Access point ID',
    required: true,
    type: 'number',
    example: 2,
  })
  @ApiNotFoundResponse({
    description: 'Access point not found',
  })
  @ApiOkResponse({
    description: 'Access point found',
    type: Accesspoint,
    example: {
      id: 2,
      buildingId: 12,
      status: 'rOff',
      ip: '172.19.65.26',
      radMac: 'a0:f8:49:df:31:20',
      ethMac: 'a0:f8:49:de:35:e8',
      name: 'ENG14-F6-R0602',
      location: 'คณะวิศวกรรมศาสตร์ อาคาร60ปี ชั้น 6 ห้อง 0602',
      numberClient: 1,
      rxbs: '0',
      txbs: '0',
      zone: '5',
      iqd: 0,
      oqd: 0,
      channel: 6,
      switchIp: '',
      model: 'AIR-AP1852I-S-K9',
      ios: 'Cisco IOS Software, C1100 Software (C1100-K9W7-M), Version 12.3(8)JA2,',
      facId: 1,
      clMax: 44,
      clAvg: '0.00',
      timestamp: '14:0:  17/12/2024',
      sumCl: '4',
      serial: 'KWC213104S3',
      picAp: 'pictureAP2.JPG',
      grpBw: 1,
      grpMan: 1,
      latitude: '13.84542',
      longtitude: '100.57015',
      switchPortId: 0,
      installTime: null,
      downtimeStart: '2025-04-07T06:32:26.000Z',
      maId: 1,
      jobStatus: 'No',
      timestamp2: '1745812377',
      crxbs: 0,
      ctxbs: 0,
      wlc: 'Yes',
      problem: '',
      channel_2: 124,
      numberClient_2: 3,
      clMax_2: 0,
      wlcActive: 'WLC-7',
      eqNumber: '8631',
      building: {
        id: 12,
        idF: 1,
        idZ: 5,
        name: 'อาคาร 14',
        pic: 'pictureBuilding12',
        comment: '',
        latitude: '13.84542',
        longtitude: '100.57015',
        codeId: 9,
      },
    },
  })
  findOne(@Param('apid') apid: string) {
    return this.accesspointsService.findOne(+apid);
  }

  @ApiOperation({
    summary: 'Get all access points in building',
  })
  @ApiParam({
    name: 'buildingId',
    description: 'Building ID',
    required: true,
    type: 'number',
    example: 1,
  })
  @ApiNotFoundResponse({
    description: 'Building not found',
  })
  @ApiOkResponse({
    description: 'All access points in building #{buildingId}',
    type: [Accesspoint],
    example: [
      {
        id: 1,
        buildingId: 1,
        name: 'Access Point 1',
        location: 'Location 1',
        status: 'active',
      },
      {
        id: 2,
        buildingId: 1,
        name: 'Access Point 2',
        location: 'Location 2',
        status: 'inactive',
      },
    ],
  })
  @Get('/building/:buildingId')
  findAllApInBuilding(@Param('buildingId') buildingId: string) {
    return this.accesspointsService.findAllApInBuilding(+buildingId);
  }

  @ApiOperation({
    summary: 'Get all access points',
  })
  @ApiOkResponse({
    description: 'All access points',
    type: [Accesspoint],
    example: [
      {
        id: 1,
        buildingId: 1,
        name: 'Access Point 1',
        location: 'Location 1',
        status: 'active',
      },
      {
        id: 2,
        buildingId: 1,
        name: 'Access Point 2',
        location: 'Location 2',
        status: 'inactive',
      },
    ],
  })
  @Get()
  findAll() {
    return this.accesspointsService.findAll();
  }
}

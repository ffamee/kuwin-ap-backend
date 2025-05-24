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
    },
  })
  @Get(':apid')
  findOne(@Param('apid') apid: string) {
    return this.accesspointsService.findOne(+apid);
  }

  @ApiOperation({
    summary: 'Get all access point names in building #{buildingId}',
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
    description: 'All access point names in building #{buildingId}',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
        },
      },
      example: [
        {
          id: 1,
          name: 'Access Point 1',
        },
        {
          id: 2,
          name: 'Access Point 2',
        },
      ],
    },
  })
  @Get('/building/name/:buildingId')
  findAllApNameInBuilding(@Param('buildingId') buildingId: string) {
    return this.accesspointsService.findAllApNameInBuilding(+buildingId);
  }

  @ApiOperation({
    summary: 'Get all access points in building',
  })
  @ApiParam({
    name: 'buildingId',
    description: 'Building ID',
    required: true,
    type: 'number',
    example: 287,
  })
  @ApiNotFoundResponse({
    description: 'Building not found',
  })
  @ApiOkResponse({
    description: 'All access points in building #{buildingId}',
    type: [Accesspoint],
    example: [
      {
        id: 5048,
        buildingId: 287,
        status: 'rOff',
        ip: '172.19.14.150',
        radMac: '70:6d:15:ab:cd:e0',
        ethMac: '00:b7:71:01:78:0a',
        name: 'Agro-Bnew',
        location: 'อาคารแปรรูป',
        numberClient: 0,
        rxbs: null,
        txbs: null,
        zone: '2',
        iqd: 0,
        oqd: 0,
        channel: 11,
        switchIp: '0',
        model: 'AIR-AP2802E-S-K9',
        ios: '0',
        facId: 20,
        clMax: 47,
        clAvg: '0.00',
        timestamp: '13:30:  29/1/2025',
        sumCl: '5',
        serial: 'FGL2238A23X',
        picAp: 'underconstruction.gif',
        grpBw: 1,
        grpMan: 1,
        latitude: '',
        longtitude: '',
        switchPortId: 0,
        installTime: '2025-01-24T09:49:44.000Z',
        downtimeStart: '2025-04-07T06:31:21.000Z',
        maId: 1,
        jobStatus: 'No',
        timestamp2: '1745812299',
        crxbs: null,
        ctxbs: null,
        wlc: 'Yes',
        problem: '',
        channel_2: 64,
        numberClient_2: 6,
        clMax_2: 0,
        wlcActive: 'WLC-7',
        eqNumber: null,
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

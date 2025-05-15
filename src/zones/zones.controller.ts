import { Controller, Get, Param } from '@nestjs/common';
import { ZonesService } from './zones.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Zone } from './entities/zone.entity';

@ApiTags('Zone *unused*')
@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  // @Post()
  // create(@Body() createZoneDto: CreateZoneDto) {
  //   return this.zonesService.create(createZoneDto);
  // }

  @ApiOperation({
    summary: 'Get all zones',
  })
  @ApiOkResponse({
    description: 'return list of all zones',
    type: [Zone],
    example: [
      {
        id: 1,
        area: 'OCS: สำนักบริการคอมพิวเตอร์, คณะเศรษฐศาสตร์, คณะบริหาร, สำนักพิพิธภัณฑ์และวัฒนธรรมการเกษตร, หอพักนิสิตหญิง, สำนักการกีฬา, สหกรณ์ออมทรัพย์,  KITS เก่า, ศูนย์เกษตรรวมใจ, สถานพยาบาล, กองกิจการนิสิต, หอพักนิสิตชาย, อาคารเทพศาสตร์สถิตย์, เรือนกล้วยไม้ระพีสาคริก',
        picture: '/pro/map/z2.jpg',
        latitude: '13.845160',
        longitude: '100.569830',
        comment: null,
      },
      {
        id: 2,
        area: 'LIB: สำนักหอสมุด, คณะเกษตร, คณะสังคมศาสตร์,  อาคารการเรียนรู้, ศูนย์เรียนรวม1-4, คณะมนุษย์ศาสตร์, สถาบันวิจัย, คณะสัตวแพทย์ศาสตร์, คณะเทคนิคการสัตวแพทย์, คณะศึกษาศาสตร์, โรงอาหารกลาง 2, โรงเรียนสาธิตเกษตร, คณะอุตสาหกรรมเกษตร, คณะวนศาสตร์',
        picture: '/pro/map/z1.jpg',
        latitude: '13.847790',
        longitude: '100.568780',
        comment: null,
      },
      {
        id: 3,
        area: 'SCI: คณะวิทยาศาสตร์, โรงเรียนอนุบาล, อาคารวิทยพัฒนา, อาคารวิทยบริการ, หอประชุมใหญ่ประตูพหลโยธิน, ภาควิชาคหกรรม, อาคารจอดรถงามวงศ์วาน',
        picture: '/pro/map/z3.jpg',
        latitude: '13.851410',
        longitude: '100.569580',
        comment: null,
      },
      {
        id: 4,
        area: '50Y: คณะประมง, คณะสถาปัตยกรรมศาสตร์, อาคารนิเทศ 50 ปี, สถาบันค้นคว้าและพัฒนาผลิตภัณฑ์อาหาร, ศูนย์เครื่องมือวิทยศาสตร์, ศูนย์พัฒนาและถ่ายทอดเทคโนโลยีรัฐร่วมเอกชน, หอพักหญิงซอย 45',
        picture: '/pro/map/z4.jpg',
        latitude: '13.853980',
        longitude: '100.569620',
        comment: null,
      },
      {
        id: 5,
        area: 'ENG: คณะวิศวกรรมศาสตร์',
        picture: '/pro/map/z6.jpg',
        latitude: '13.848000',
        longitude: '100.572000',
        comment: null,
      },
      {
        id: 6,
        area: 'RAPEE: อาคารระพีสาคริก, โรงอาหารกลาง 1, สระว่ายน้ำจุฬาภรณ์, หอพักหญิง, อาคารจักรพันธ์เพ็ญศิริ, บัณฑิตวิทยาลัย, พัฒนาสังคม,  สำนักส่งเสริม',
        picture: '/pro/map/z7.jpg',
        latitude: '13.844020',
        longitude: '100.575160',
        comment: null,
      },
    ],
  })
  @Get()
  findAll() {
    return this.zonesService.findAll();
  }

  @ApiOperation({
    summary: 'Get zone by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Zone ID',
    required: true,
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Zone details',
    type: Zone,
    example: {
      id: 1,
      area: 'OCS: สำนักบริการคอมพิวเตอร์, คณะเศรษฐศาสตร์, คณะบริหาร, สำนักพิพิธภัณฑ์และวัฒนธรรมการเกษตร, หอพักนิสิตหญิง, สำนักการกีฬา, สหกรณ์ออมทรัพย์,  KITS เก่า, ศูนย์เกษตรรวมใจ, สถานพยาบาล, กองกิจการนิสิต, หอพักนิสิตชาย, อาคารเทพศาสตร์สถิตย์, เรือนกล้วยไม้ระพีสาคริก',
      picture: '/pro/map/z2.jpg',
      latitude: '13.845160',
      longitude: '100.569830',
      comment: null,
    },
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zonesService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateZoneDto: UpdateZoneDto) {
  //   return this.zonesService.update(+id, updateZoneDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.zonesService.remove(+id);
  // }
}

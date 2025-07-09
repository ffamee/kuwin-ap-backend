import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Building } from './entities/building.entity';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@ApiTags('Building')
@Controller('buildings')
export class BuildingsController {
  constructor(
    private readonly buildingsService: BuildingsService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Get building overview by buildingID' })
  @ApiQuery({
    name: 'sec',
    required: true,
    description:
      'Section ID (1 for faculty, 2 for organization, 3 for dormitory)',
    type: Number,
  })
  @ApiQuery({
    name: 'entity',
    required: true,
    description: 'Entity ID',
    type: Number,
  })
  @ApiQuery({
    name: 'build',
    required: true,
    description: 'Building ID',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Building with the given ID not found',
  })
  @ApiOkResponse({
    description: 'Building overview',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Main Building' },
        apAll: { type: 'number', example: 10 },
        apMaintain: { type: 'number', example: 2 },
        apDown: { type: 'number', example: 8 },
        totalUser: { type: 'number', example: 100 },
        accesspoints: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Access Point 1' },
              status: { type: 'string', example: 'active' },
            },
          },
        },
      },
    },
  })
  @Get('overview')
  getBuildingOverview(
    @Query('sec') sectionId: string,
    @Query('entity') entityId: string,
    @Query('build') buildingId: string,
  ) {
    return this.buildingsService.getBuildingOverview(
      +sectionId,
      +entityId,
      +buildingId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all buildings' })
  @ApiOkResponse({
    description: 'All buildings',
    type: [Building],
  })
  findAll() {
    return this.buildingsService.findAll();
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('pic', {
      storage: memoryStorage(),
      fileFilter(req, file, callback) {
        // allow not uploading file
        if (!file) {
          return callback(null, true);
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'File type not matched with jpeg, png, or gif',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() createBuildingDto: CreateBuildingDto,
  ) {
    return this.buildingsService.create(createBuildingDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.buildingsService.remove(+id);
  }

  @Delete('move/:id')
  moveAndDelete(@Param('id') id: string) {
    return this.buildingsService.moveAndDelete(+id);
  }

  @Post('edit/:id')
  @UseInterceptors(
    FileInterceptor('pic', {
      storage: memoryStorage(),
      fileFilter(req, file, callback) {
        // allow not uploading file
        if (!file) {
          return callback(null, true);
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'File type not matched with jpeg, png, or gif',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  edit(
    @Param('id') id: string,
    @Body() updateBuildingDto: UpdateBuildingDto,
    @Query('confirm') confirm: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return this.buildingsService.edit(
      +id,
      updateBuildingDto,
      confirm === 'true',
      file,
    );
  }
}

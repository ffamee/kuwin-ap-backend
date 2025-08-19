import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigurationsService } from './configurations.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

@Controller('configurations')
export class ConfigurationsController {
  constructor(private readonly configurationsService: ConfigurationsService) {}

  @ApiOperation({
    summary: 'Get all configurations',
  })
  @ApiOkResponse({
    description: 'Returns all configurations',
  })
  @Get('all')
  getAll() {
    return this.configurationsService.getAll();
  }

  @ApiOperation({
    summary: 'Get configurations in not working status',
  })
  @ApiOkResponse({
    description: 'Returns configurations with status down',
  })
  @Get('down')
  getDown() {
    return this.configurationsService.getDown();
  }

  @ApiOperation({
    summary: 'Get configurations detail',
  })
  @ApiQuery({
    name: 'sec',
    required: true,
    type: 'number',
    description: 'Section ID',
  })
  @ApiQuery({
    name: 'entity',
    required: true,
    type: 'number',
    description: 'Entity ID',
  })
  @ApiQuery({
    name: 'build',
    required: true,
    type: 'number',
    description: 'Building ID',
  })
  @ApiQuery({
    name: 'loc',
    required: true,
    type: 'number',
    description: 'Location ID',
  })
  @ApiNotFoundResponse({
    description: 'Configuration not found',
  })
  @ApiOkResponse({
    description: 'Returns configurations detail',
  })
  @Get('detail')
  getDetail(
    @Query('sec') sec: string,
    @Query('entity') entity: string,
    @Query('build') build: string,
    @Query('loc') loc: string,
  ) {
    return this.configurationsService.getDetail(+sec, +entity, +build, +loc);
  }

  @Post('create')
  create(
    @Body()
    createConfigurationDto: CreateConfigurationDto,
  ) {
    return this.configurationsService.create(createConfigurationDto);
  }

  @Post('edit/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'ap', maxCount: 1 },
        { name: 'location', maxCount: 1 },
      ],
      {
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
      },
    ),
  )
  edit(
    @UploadedFiles()
    files: { ap?: Express.Multer.File[]; location?: Express.Multer.File[] },
    @Body()
    createConfigurationDto: { name: string; buildingId: number; ip: string },
  ) {
    console.dir({ files, createConfigurationDto }, { depth: null });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.configurationsService.remove(+id);
  }
}

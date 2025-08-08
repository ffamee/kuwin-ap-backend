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

@Controller('configurations')
export class ConfigurationsController {
  constructor(private readonly configurationsService: ConfigurationsService) {}

  @Get('all')
  getAll() {
    return this.configurationsService.getAll();
  }

  @Get('down')
  getDown() {
    return this.configurationsService.getDown();
  }

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

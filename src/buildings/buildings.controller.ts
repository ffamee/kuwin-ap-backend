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
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Building } from './entities/building.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@ApiTags('Building')
@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

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
    // return this.buildingsService.getBuildingOverview(
    return this.buildingsService.find(+sectionId, +entityId, +buildingId);
  }

  // @Get(':id')
  // find(@Param('id') id: string) {
  //   return this.buildingsService.find(+id);
  // }

  @ApiOperation({ summary: 'Create a new building' })
  @ApiBody({
    description: 'Building data',
    type: CreateBuildingDto,
    examples: {
      createBuilding: {
        value: {
          name: 'New Building',
          comment: 'This is a new building (this field is optional)',
          entityId: 1,
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Building created successfully',
    type: Building,
  })
  @ApiNotFoundResponse({
    description: 'Entity with the given ID not found',
  })
  @ApiResponse({
    status: 413,
    description: 'File too large, maximum size is 10MB',
  })
  @ApiBadRequestResponse({
    description: 'File type not matched with jpeg, png, or gif',
  })
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

  @ApiOperation({ summary: 'Delete a building by ID' })
  @ApiNotFoundResponse({
    description: 'Building with the given ID not found',
  })
  @ApiOkResponse({
    description: 'Building deleted successfully',
  })
  @ApiConflictResponse({
    description: 'Building cannot be deleted because it has access points',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.buildingsService.remove(+id);
  }

  @ApiOperation({
    summary: 'Move a building to the default entity and delete it',
  })
  @ApiNotFoundResponse({
    description: 'Building with the given ID not found',
  })
  @ApiOkResponse({
    description: 'Building moved to default entity and deleted successfully',
  })
  @Delete('move/:id')
  moveAndDelete(@Param('id') id: string) {
    return this.buildingsService.moveAndDelete(+id);
  }

  @ApiOperation({ summary: 'Edit a building by ID' })
  @ApiBody({
    description: 'Updated building data',
    type: UpdateBuildingDto,
    examples: {
      updateBuilding: {
        value: {
          name: 'Updated Building Name (this field is optional)',
          comment: 'Updated comment (this field is optional)',
          entityId: 1, // Entity ID must be provided
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Building updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Building with the given ID not found',
  })
  @ApiResponse({
    status: 413,
    description: 'File too large, maximum size is 10MB',
  })
  @ApiBadRequestResponse({
    description: 'File type not matched with jpeg, png, or gif',
  })
  @ApiConflictResponse({
    description: 'Building cannot be edited because it has access points',
  })
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

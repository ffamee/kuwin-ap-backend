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
import { EntitiesService } from './entities.service';
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
import { CreateEntityDto } from './dto/create-entity.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UpdateEntityDto } from './dto/update-entity.dto';

@ApiTags('Entity')
@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @ApiOperation({
    summary: 'Get all buildings in entities with their names',
  })
  @ApiOkResponse({
    description: 'return object with key as entity id',
    schema: {
      type: 'object',
      properties: {
        id: {
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Section 1' },
            buildings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Building 1' },
                },
              },
            },
          },
        },
      },
    },
  })
  @Get('name')
  findAllName() {
    return this.entitiesService.findAllName();
  }

  @ApiOperation({
    summary: 'Get entity overview by entity ID',
  })
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
  @ApiNotFoundResponse({
    description: 'Entity with the given ID not found',
  })
  @ApiOkResponse({
    description: 'Overview of the entity',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Entity Name' },
        apAll: { type: 'number', example: 10 },
        apMaintain: { type: 'number', example: 5 },
        apDown: { type: 'number', example: 2 },
        totalUser: { type: 'number', example: 100 },
        buildings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Building Name' },
              apAll: { type: 'number', example: 10 },
              apMaintain: { type: 'number', example: 5 },
              apDown: { type: 'number', example: 2 },
              user1: { type: 'number', example: 50 },
              user2: { type: 'number', example: 50 },
            },
          },
        },
        accesspoints: {
          type: 'object',
          properties: {
            id: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  status: { type: 'string', example: 'active' },
                  ip: { type: 'string', example: '1.1.1.1' },
                  name: { type: 'string', example: 'Accesspoint Name' },
                  location: { type: 'string', example: 'Location Name' },
                  numberClient: { type: 'number', example: 50 },
                  numberClient_2: { type: 'number', example: 50 },
                },
              },
            },
          },
        },
      },
    },
  })
  @Get('overview')
  getEntityOverview(
    @Query('sec') sectionId: string,
    @Query('entity') entityId: string,
  ) {
    return this.entitiesService.getEntityOverview(+sectionId, +entityId);
  }

  @ApiOperation({
    summary: 'Get all entities for each section',
  })
  @ApiOkResponse({
    description: 'return object with key as section name of all entities',
    schema: {
      type: 'object',
      properties: {
        faculty: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
            },
            example: [
              {
                id: 1,
                name: 'Faculty 1',
              },
              {
                id: 2,
                name: 'Faculty 2',
              },
            ],
          },
        },
        organization: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
            },
            example: [
              {
                id: 1,
                name: 'Organization 1',
              },
              {
                id: 2,
                name: 'Organization 2',
              },
            ],
          },
        },
        dormitory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
            },
            example: [
              {
                id: 1,
                name: 'Dormitory 1',
              },
              {
                id: 2,
                name: 'Dormitory 2',
              },
            ],
          },
        },
      },
    },
  })
  @Get()
  findAll() {
    return this.entitiesService.findAll();
  }

  @ApiOperation({
    summary: 'Create a new entity',
  })
  @ApiBody({
    description: 'Create a new entity with name and section',
    type: CreateEntityDto,
    examples: {
      createEntity: {
        value: {
          name: 'New Entity',
          section: 1, // 1 for faculty, 2 for organization, 3 for dormitory
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Entity created successfully',
  })
  @ApiNotFoundResponse({
    description: 'Section with the given ID not found',
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
      // storage: diskStorge({
      //   filename: (req, file, cb) => {
      //     const ext = file.originalname.split('.').pop();
      //     const filename = `${Date.now()}.${ext}`;
      //     cb(null, filename);
      //   },
      //   destination: join(
      //     process.cwd(),
      //     process.env.UPLOAD_DIR || 'uploads',
      //     'entities',
      //   ),
      // }),
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
    @Body() createEntityDto: CreateEntityDto,
  ) {
    return this.entitiesService.create(createEntityDto, file);
  }

  @ApiOperation({
    summary: 'Delete an entity by ID',
  })
  @ApiOkResponse({
    description: 'Entity deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Entity with ID 1 deleted successfully',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Entity with the given ID not found',
  })
  @ApiConflictResponse({
    description:
      'Entity with the given ID has associated buildings and cannot be deleted',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.entitiesService.remove(+id);
  }

  @ApiOperation({
    summary: 'Move entity to default entity and delete it',
  })
  @ApiOkResponse({
    description:
      'Entity moved buildings to default entity and deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example:
            'Entity with ID 1 moved buildings to default entity and deleted successfully',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Entity with the given ID not found',
  })
  @Delete('move/:id')
  moveAndDelete(@Param('id') id: string) {
    return this.entitiesService.moveAndDelete(+id);
  }

  @ApiOperation({
    summary: 'Edit an entity by ID',
  })
  @ApiBody({
    description: 'Update entity details',
    type: UpdateEntityDto,
  })
  @ApiOkResponse({
    description: 'Entity updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Entity with the given ID not found',
  })
  @ApiConflictResponse({
    description:
      'Entity with the given ID has associated buildings and cannot be updated',
  })
  @ApiResponse({
    status: 413,
    description: 'File too large, maximum size is 10MB',
  })
  @ApiBadRequestResponse({
    description: 'File type not matched with jpeg, png, or gif',
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
    @Body() updateEntityDto: UpdateEntityDto,
    @Query('confirm') confirm: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return this.entitiesService.edit(
      +id,
      updateEntityDto,
      confirm === 'true',
      file,
    );
  }
}

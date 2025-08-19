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
  ApiParam,
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
    summary:
      'Get all buildings in entities with their names (unused in frontend /report)',
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
        buildings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Building Name' },
              count: {
                type: 'number',
                example: 10,
                description:
                  'Count of metrics in buildings e.g. configCount, downCount clientCount',
              }, // Number of buildings
            },
          },
        },
        sectionId: { type: 'number', example: 1 }, // Section ID
        count: {
          type: 'number',
          description:
            'Count of metrics in entity e.g. configCount, downCount clientCount',
          example: 5,
        }, // Count of metrics in entity
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
          sectionId: 1, // 1 for faculty, 2 for organization, 3 for dormitory
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Entity created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'New Entity' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Section with the given ID not found',
  })
  @ApiConflictResponse({
    description: 'Entity with the given name already exists',
  })
  @ApiResponse({
    status: 413,
    description: 'File too large, maximum size is 10MB (error from multer)',
  })
  @ApiBadRequestResponse({
    description: 'File type not matched with jpeg, png, or gif',
  })
  @Post('create')
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
  @ApiParam({
    name: 'id',
    description: 'ID of the entity to delete',
    type: Number,
    required: true,
    example: 1,
  })
  @ApiQuery({
    name: 'confirm',
    required: false,
    description: 'Confirm deletion of the entity',
    schema: {
      type: 'string',
    },
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
  remove(@Param('id') id: string, @Query('confirm') confirm: string) {
    return this.entitiesService.remove(+id, confirm === 'true');
  }

  @ApiOperation({
    summary: 'Edit an entity by ID',
  })
  @ApiBody({
    description: 'Update entity details',
    type: UpdateEntityDto,
    examples: {
      updateEntity: {
        value: {
          name: 'Updated Entity',
          sectionId: 1, // 1 for faculty, 2 for organization, 3 for dormitory
        },
      },
    },
  })
  @ApiQuery({
    name: 'confirm',
    required: false,
    schema: {
      type: 'string',
    },
  })
  @ApiOkResponse({
    description: 'Entity updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Updated Entity' },
      },
    },
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

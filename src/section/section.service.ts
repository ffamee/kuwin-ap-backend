import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Section } from './entities/section.entity';
import { DataSource, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSectionDto } from './dto/create-section.dto';
import { Entity } from '../entities/entities/entity.entity';
import { UpdateSectionDto } from './dto/update-section.dto';
import { InfluxService } from '../influx/influx.service';
import { ConfigurationsService } from '../configurations/configurations.service';
import {
  c24Count,
  c5Count,
  c6Count,
  configCount,
  downCount,
  maCount,
} from 'src/shared/sql-query/query';

@Injectable()
export class SectionService {
  constructor(
    private dataSource: DataSource,
    @Inject(forwardRef(() => InfluxService))
    private readonly influxService: InfluxService,
    private readonly configurationsService: ConfigurationsService,
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
  ) {}

  async create(createSectionDto: CreateSectionDto): Promise<Section> {
    if (
      await this.sectionRepository.exists({
        where: { name: createSectionDto.name },
      })
    ) {
      throw new ConflictException(
        `Section with name ${createSectionDto.name} already exists`,
      );
    }
    return this.sectionRepository.save(createSectionDto);
  }

  async remove(id: number, confirm: boolean) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const section = await manager.findOne(Section, {
          where: { id },
          relations: ['entities'],
          lock: { mode: 'pessimistic_write' },
        });
        if (section) {
          if (section.entities.length > 0) {
            if (confirm) {
              await manager.update(
                Entity,
                { section: { id } },
                { section: { id: 8 } },
              );
            } else {
              throw new ConflictException(
                `Section with id ${id} cannot be deleted because it has associated entities`,
              );
            }
          }
          await manager.delete(Section, { id });
          return {
            message: `Section with id ${id} moved entities to default section and deleted successfully`,
          };
        } else {
          throw new NotFoundException(`Section with id ${id} not found`);
        }
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // rethrow NotFoundException
      }
      if (error instanceof ConflictException) {
        throw error; // rethrow ConflictException
      }
      throw new InternalServerErrorException(
        `Section with id ${id} cannot be deleted because ${error}`,
      );
    }
  }

  async edit(id: number, UpdateSectionDto: UpdateSectionDto) {
    if (!(await this.sectionRepository.exists({ where: { id } }))) {
      throw new NotFoundException(`Section with id ${id} not found`);
    }
    if (
      await this.sectionRepository.exists({
        where: { name: UpdateSectionDto.name, id: Not(id) },
      })
    ) {
      throw new ConflictException(
        `Section with name ${UpdateSectionDto.name} already exists`,
      );
    }
    return this.sectionRepository.save({ ...UpdateSectionDto, id });
  }

  exist(sectionId: number): Promise<boolean> {
    return this.sectionRepository.exists({ where: { id: sectionId } });
  }

  async findAllName(): Promise<Record<string, Section>> {
    const res = this.sectionRepository.find({
      select: {
        id: true,
        name: true,
        entities: {
          id: true,
          name: true,
        },
      },
      relations: { entities: true },
      where: { id: Not(4) },
    });

    const sections: Record<string, Section> = (await res).reduce(
      (acc, section) => {
        acc[section.id.toString()] = section;
        return acc;
      },
      {} as Record<string, Section>,
    );

    return sections;
  }

  async getSectionOverview(sectionId: number) {
    const [section, num, numEach] = await Promise.all([
      this.sectionRepository.findOne({
        where: { id: sectionId },
        relations: ['entities'],
        select: {
          id: true,
          name: true,
          entities: {
            id: true,
            name: true,
          },
        },
      }),
      this.sectionRepository
        .createQueryBuilder('section')
        .leftJoin('section.entities', 'entity')
        .leftJoin('entity.buildings', 'building')
        .leftJoin('building.locations', 'location')
        .leftJoin('location.configuration', 'configuration')
        .leftJoin('configuration.accesspoint', 'accesspoint')
        .leftJoin('configuration.ip', 'ip')
        .select(configCount, 'configCount')
        .addSelect(downCount, 'downCount')
        .addSelect(maCount, 'maCount')
        .addSelect(c24Count, 'c24Count')
        .addSelect(c5Count, 'c5Count')
        .addSelect(c6Count, 'c6Count')
        .where('section.id = :sectionId', { sectionId })
        .getRawOne<{
          configCount: number;
          downCount: number;
          maCount: number;
          c24Count: number;
          c5Count: number;
          c6Count: number;
        }>(),
      this.sectionRepository
        .createQueryBuilder('section')
        .leftJoin('section.entities', 'entity')
        .leftJoin('entity.buildings', 'building')
        .leftJoin('building.locations', 'location')
        .leftJoin('location.configuration', 'configuration')
        .leftJoin('configuration.accesspoint', 'accesspoint')
        .leftJoin('configuration.ip', 'ip')
        .select('entity.id', 'entityId')
        .addSelect(configCount, 'configCount')
        .addSelect(downCount, 'downCount')
        .addSelect(maCount, 'maCount')
        .addSelect(c24Count, 'c24Count')
        .addSelect(c5Count, 'c5Count')
        .addSelect(c6Count, 'c6Count')
        .where('section.id = :sectionId', { sectionId })
        .groupBy('entity.id')
        .getRawMany<{
          entityId: number;
          configCount: number;
          downCount: number;
          maCount: number;
          c24Count: number;
          c5Count: number;
          c6Count: number;
        }>(),
    ]);
    if (!section || !num || !numEach) {
      throw new NotFoundException(`Section with id ${sectionId} not found`);
    }
    return {
      ...{
        ...section,
        entities: section.entities.flatMap((entity) => {
          const e = numEach.find((e) => e.entityId === entity.id);
          const { entityId: _, ...rest } = e || {};
          if (e) return { ...entity, ...rest };
          return entity;
        }),
      },
      ...num,
    };
  }

  async getMonitor() {
    const [sections, num, numEach] = await Promise.all([
      this.sectionRepository.find({ select: { id: true, name: true } }),
      this.configurationsService.countAll(),
      this.sectionRepository
        .createQueryBuilder('section')
        .leftJoin('section.entities', 'entity')
        .leftJoin('entity.buildings', 'building')
        .leftJoin('building.locations', 'location')
        .leftJoin('location.configuration', 'configuration')
        .leftJoin('configuration.accesspoint', 'accesspoint')
        .leftJoin('configuration.ip', 'ip')
        .select('section.id', 'sectionId')
        .addSelect(configCount, 'configCount')
        .addSelect(downCount, 'downCount')
        .addSelect(maCount, 'maCount')
        .addSelect(c24Count, 'c24Count')
        .addSelect(c5Count, 'c5Count')
        .addSelect(c6Count, 'c6Count')
        .groupBy('section.id')
        .getRawMany<{
          sectionId: number;
          configCount: number;
          downCount: number;
          maCount: number;
          c24Count: number;
          c5Count: number;
          c6Count: number;
        }>(),
    ]);
    return {
      sections: sections.flatMap((section) => {
        const s = numEach.find((s) => s.sectionId === section.id);
        const { sectionId: _, ...rest } = s || {};
        if (s) return { ...section, ...rest };
        return section;
      }),
      ...num,
    };
  }
}

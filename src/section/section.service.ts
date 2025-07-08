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
import { AccesspointsService } from '../accesspoints/accesspoints.service';
import { EntitiesService } from '../entities/entities.service';
import { Entity } from '../entities/entities/entity.entity';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
    @Inject(forwardRef(() => AccesspointsService))
    private readonly accesspointsService: AccesspointsService,
    @Inject(forwardRef(() => EntitiesService))
    private readonly entitiesService: EntitiesService,
  ) {}

  findAll(): Promise<Section[]> {
    return this.sectionRepository.find({ where: { id: Not(4) } });
  }

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

  async remove(id: number) {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: ['entities'],
    });
    if (!section) {
      throw new NotFoundException(`Section with id ${id} not found`);
    }
    if (section.entities.length > 0) {
      throw new ConflictException(
        `Section with id ${id} cannot be deleted because it has associated entities`,
      );
    }
    return this.sectionRepository.delete(id).then(() => {
      return {
        message: `Section with id ${id} deleted successfully`,
      };
    });
  }

  async moveAndDelete(id: number) {
    // use transaction to ensure atomicity to move entities to default section (id: 8) and delete section
    try {
      await this.dataSource.transaction(async (manager) => {
        const section = await manager.findOne(Section, {
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });
        if (section) {
          await manager.update(
            Entity,
            { section: { id } },
            { section: { id: 8 } },
          );
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
      throw new InternalServerErrorException(
        `Section with id ${id} cannot be deleted because ${error}`,
      );
    }

    // other ways to implement lock writing
    // await manager
    // 	.createQueryBuilder(Section, 'section')
    // 	.setLock('pessimistic_write')
    // 	.where('section.id = :id', { id })
    // 	.getOne();

    // Solution by Query Runner
    // const queryRunner = this.dataSource.createQueryRunner();
    // await queryRunner.connect();
    // const exists = await queryRunner.manager.exists(Section, { where: { id } });
    // if (!exists) {
    //   throw new NotFoundException(`Section with id ${id} not found`);
    // }
    // await queryRunner.startTransaction();

    // try {
    //   await queryRunner.manager.update(
    //     Entity,
    //     { section: { id } },
    //     { section: { id: 8 } },
    //   );
    //   await queryRunner.manager.delete(Section, { id });
    // } catch (error) {
    //   await queryRunner.rollbackTransaction();
    //   throw error;
    // } finally {
    //   await queryRunner.release();
    // }
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
    return this.sectionRepository.update(id, UpdateSectionDto);
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
    const section = await this.sectionRepository.findOne({
      where: { id: sectionId },
    });
    if (!section) {
      throw new NotFoundException(`SectionId ${sectionId} not found`);
    }
    const [apAll, apMaintain, apDown, totalUser, entities] = await Promise.all([
      this.accesspointsService.countAPInSection(sectionId),
      this.accesspointsService.countAPMaintainInSection(sectionId),
      this.accesspointsService.countAPDownInSection(sectionId),
      this.accesspointsService.sumAllClientInSection(sectionId),
      this.entitiesService.findEntitiesWithApCount(sectionId),
    ]);
    // table => name, ap in entity, ap maintain in entity, ap down in entity, total user in entity, wlc in entity
    return {
      id: section.id,
      name: section.name,
      apAll,
      apMaintain,
      apDown,
      totalUser,
      entities,
    };
  }

  async findAllOverview() {
    return this.sectionRepository
      .createQueryBuilder('section')
      .leftJoin('section.entities', 'entity')
      .leftJoin('entity.buildings', 'building')
      .leftJoin('building.accesspoints', 'accesspoint')
      .where('section.id != :id', { id: 4 })
      .select('section.id', 'id')
      .addSelect('section.name', 'name')
      .addSelect('COUNT(accesspoint.id)', 'apAll')
      .addSelect(
        `COUNT(CASE WHEN accesspoint.Status = 'ma' THEN 1 END)`,
        'apMaintain',
      )
      .addSelect(
        `COUNT(CASE WHEN accesspoint.Status = 'down' THEN 1 END)`,
        'apDown',
      )
      .addSelect('SUM(accesspoint.numberClient)', 'user1')
      .addSelect('SUM(accesspoint.numberClient_2)', 'user2')
      .groupBy('section.id')
      .addGroupBy('section.name')
      .getRawMany();
  }

  async getMonitorOverview() {
    const [apAll, apMaintain, apDown, totalUser, sections] = await Promise.all([
      this.accesspointsService.countAllAP(),
      this.accesspointsService.countAllAPMaintain(),
      this.accesspointsService.countAllAPDown(),
      this.accesspointsService.sumAllClient(),
      this.findAllOverview(),
    ]);

    return {
      apAll,
      apMaintain,
      apDown,
      totalUser,
      sections,
    };
  }
}

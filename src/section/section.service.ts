import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Section } from './entities/section.entity';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSectionDto } from './dto/create-section.dto';
import { AccesspointsService } from '../accesspoints/accesspoints.service';
import { EntitiesService } from '../entities/entities.service';

@Injectable()
export class SectionService {
  constructor(
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

  create(createSectionDto: CreateSectionDto): Promise<Section> {
    return this.sectionRepository.save(createSectionDto);
  }

  exist(section: string): Promise<boolean> {
    return this.sectionRepository.exists({ where: { name: section } });
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

  findAllData(): Promise<Section[]> {
    return this.sectionRepository.find({
      select: {
        id: true,
        name: true,
        entities: {
          id: true,
          name: true,
          buildings: {
            id: true,
            name: true,
            accesspoints: {
              id: true,
              name: true,
            },
          },
        },
      },
      where: { id: Not(4) },
      relations: { entities: { buildings: { accesspoints: true } } },
    });
  }

  async getOverview(sec: string) {
    const section = await this.sectionRepository.findOne({
      where: { name: sec },
    });
    if (!section) {
      throw new NotFoundException(`Section ${sec} not found`);
    }
    const [apAll, apMaintain, apDown, totalUser, entities] = await Promise.all([
      this.accesspointsService.countAPInSection(sec),
      this.accesspointsService.countAPMaintainInSection(sec),
      this.accesspointsService.countAPDownInSection(sec),
      this.accesspointsService.sumAllClientInSection(sec),
      this.entitiesService.findEntitiesWithApCount(sec),
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
}

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Configuration } from './entities/configuration.entity';
import { DataSource, Not, Repository } from 'typeorm';
import { IpService } from '../ip/ip.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { LocationsService } from '../locations/locations.service';
import { StatusState } from 'src/shared/types/define-state';
import {
  c24Count,
  c5Count,
  c6Count,
  configCount,
  downCount,
  maCount,
} from 'src/shared/sql-query/query';
import { Metrics } from 'src/shared/types/snmp-metrics';
import { AccesspointsService } from 'src/accesspoints/accesspoints.service';
import { History } from 'src/histories/entities/history.entity';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { Location } from 'src/locations/entities/location.entity';

@Injectable()
export class ConfigurationsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Configuration)
    private configurationsRepository: Repository<Configuration>,
    private readonly ipService: IpService,
    private readonly locationsService: LocationsService,
    private readonly accesspointsService: AccesspointsService,
  ) {}

  async create(configuration: CreateConfigurationDto) {
    if (
      (await this.configurationsRepository.exists({
        where: { ip: { ip: configuration.ip } },
      })) ||
      (await this.configurationsRepository.exists({
        where: {
          location: {
            name: configuration.name,
            building: { id: configuration.buildingId },
          },
        },
      }))
    ) {
      throw new ConflictException(
        'Configuration with this IP or location already exists',
      );
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const ip = await this.ipService.getIp(manager, configuration.ip);
        if (!ip) {
          throw new ConflictException(
            'IP address not found or could not be created',
          );
        }
        const location = await this.locationsService.getLocation(
          manager,
          configuration.name,
          configuration.buildingId,
        );
        if (!location) {
          throw new ConflictException(
            'Location not found or could not be created',
          );
        }
        const raw = await manager.insert(Configuration, {
          ip: { id: ip },
          location: { id: location },
        });
        const configId = (raw.identifiers[0] as { id: number }).id;
        return manager.findOne(Configuration, {
          where: { id: configId },
          relations: ['ip', 'location', 'accesspoint'],
          select: {
            ip: { id: true, ip: true },
            location: {
              id: true,
              name: true,
            },
            accesspoint: { id: true, name: true },
          },
        });
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `An error occurred while creating the configuration,
        ${error}`,
      );
    }
  }

  /*not finished*/
  async edit(
    id: number,
    files: {
      ap: Express.Multer.File | undefined;
      location: Express.Multer.File | undefined;
    },
    updateConfigurationDto: UpdateConfigurationDto,
  ) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const config = await manager.findOne(Configuration, {
          where: { id },
          select: {
            ip: { id: true, ip: true },
            location: { id: true, name: true, building: { id: true } },
          },
          relations: ['ip', 'location', 'location.building'],
          lock: { mode: 'pessimistic_write' },
        });
        if (config) {
          if (
            (updateConfigurationDto.ip &&
              config.ip.ip !== updateConfigurationDto.ip) ||
            (updateConfigurationDto.buildingId &&
              config.location.building.id !== updateConfigurationDto.buildingId)
          ) {
            // delete old and save new
            const ip = updateConfigurationDto.ip
              ? await this.ipService.getIp(manager, updateConfigurationDto.ip)
              : null;
            let location: number | null = config.location.id;
            if (updateConfigurationDto.buildingId) {
              location = await this.locationsService.getLocation(
                manager,
                updateConfigurationDto.name ?? config.location.name,
                updateConfigurationDto.buildingId,
              );
            } else {
              // rename and check duplicate location name
              if (updateConfigurationDto.name) {
                if (
                  await manager.exists(Location, {
                    where: {
                      name: updateConfigurationDto.name,
                      id: Not(location),
                      building: { id: config.location.building.id },
                    },
                  })
                ) {
                  throw new ConflictException(
                    `Location with name ${updateConfigurationDto.name} already exists`,
                  );
                }

                await manager.update(Location, location ?? config.location.id, {
                  name: updateConfigurationDto.name,
                });
              }
            }

            if (!location)
              throw new InternalServerErrorException(
                'Location error or not be created',
              );

            // const {
            //   id: _id,
            //   createdAt: _createdAt,
            //   lastSeenAt: _lastSeenAt,
            //   ...details
            // } = config;
            const newConfig = manager.create(Configuration, {
              // ...(ip ? { ip: { id: ip } } : { ...details }),
              ip: { id: ip ?? config.ip.id },
              location: { id: location },
            });
            if (config.status !== StatusState.Pending) {
              await manager.insert(History, {
                configId: config.id,
                startedAt: config.createdAt,
                accesspoint: config.accesspoint,
                ip: config.ip,
                location: config.location,
              });
            }
            if (location !== config.location.id)
              await this.locationsService.softDeleteLocation(
                manager,
                config.location.id,
              );
            await manager.remove(Configuration, config);
            const raw = await manager.insert(Configuration, newConfig);
            const configId = (raw.identifiers[0] as { id: number }).id;
            return manager.findOne(Configuration, {
              where: { id: configId },
              relations: ['ip', 'location', 'accesspoint'],
              select: {
                ip: { id: true, ip: true },
                location: {
                  id: true,
                  name: true,
                },
                accesspoint: { id: true, name: true },
              },
            });
          } else {
            // only change location name
            const { name, ..._rest } = updateConfigurationDto;
            if (name && name !== config.location.name) {
              const checkDup = await manager.findOne(Location, {
                where: {
                  name,
                  id: Not(config.location.id),
                  building: { id: config.location.building.id },
                },
              });
              if (checkDup) {
                throw new ConflictException(
                  `Location with name ${name} already exists`,
                );
              }
              await manager.update(Location, config.location.id, {
                name,
              });
            }
            return manager.findOne(Configuration, {
              where: { id },
              relations: ['ip', 'location', 'accesspoint'],
              select: {
                ip: { id: true, ip: true },
                location: {
                  id: true,
                  name: true,
                },
                accesspoint: { id: true, name: true },
              },
            });
          }
        } else
          throw new NotFoundException(`Configuration with ID ${id} not found`);
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `An error occurred while editing the configuration with ID ${id}, ${error}`,
      );
    }
  }

  async remove(id: number) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const config = await manager.findOne(Configuration, {
          where: { id },
          lock: { mode: 'pessimistic_write' },
          relations: ['ip', 'location', 'accesspoint'],
          select: {
            accesspoint: { id: true },
            ip: { id: true },
            location: { id: true },
          },
        });
        if (!config) {
          throw new NotFoundException(`Configuration with ID ${id} not found`);
        }
        // create new history record after delete
        if (config.status !== StatusState.Pending) {
          await manager.insert(History, {
            configId: config.id,
            startedAt: config.createdAt,
            accesspoint: config.accesspoint,
            ip: config.ip,
            location: config.location,
          });
        }
        await this.locationsService.softDeleteLocation(
          manager,
          config.location.id,
        );
        await manager.remove(Configuration, config);
        return {
          message: `Configuration with ID ${id} removed successfully`,
        };
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `An error occurred while removing the configuration with ID ${id}, ${error}`,
      );
    }
  }

  async getAll() {
    return this.configurationsRepository.find({
      relations: [
        'ip',
        'location',
        'accesspoint',
        'location.building',
        'location.building.entity',
        'location.building.entity.section',
      ],
      select: {
        ip: { id: true, ip: true },
        location: {
          id: true,
          name: true,
          building: {
            id: true,
            entity: { id: true, section: { id: true } },
          },
        },
        accesspoint: { id: true, name: true },
      },
    });
  }

  async getDown() {
    return this.configurationsRepository
      .createQueryBuilder('configuration')
      .leftJoin('configuration.accesspoint', 'accesspoint')
      .leftJoin('configuration.location', 'location')
      .leftJoin('configuration.ip', 'ip')
      .leftJoin('location.building', 'building')
      .leftJoin('building.entity', 'entity')
      .leftJoin('entity.section', 'section')
      .where(
        'configuration.status IN (:down , :download, :maintenance, :pending)',
        {
          down: StatusState.Down,
          download: StatusState.Download,
          maintenance: StatusState.Maintenance,
          pending: StatusState.Pending,
        },
      )
      .orWhere('configuration.lastSeenAt < NOW() - INTERVAL 5 MINUTE')
      .select([
        'configuration',
        'accesspoint.id',
        'accesspoint.name',
        'ip.id',
        'ip.ip',
        'location.id',
        'location.name',
        'building.id',
        'entity.id',
        'section.id',
      ])
      .getMany();
  }

  async getDetail(
    sec: number,
    entity: number,
    build: number,
    loc: number,
  ): Promise<Configuration> {
    const configuration = await this.configurationsRepository.findOne({
      where: {
        location: {
          id: loc,
          building: { id: build, entity: { id: entity, section: { id: sec } } },
        },
      },
      relations: [
        'ip',
        'location',
        'location.building',
        'location.histories',
        'accesspoint',
      ],
      select: {
        ip: { id: true, ip: true },
        location: {
          id: true,
          name: true,
          building: { id: true, name: true },
          histories: true,
        },
        accesspoint: true,
      },
    });
    if (!configuration) {
      throw new NotFoundException(
        `Configuration in location ID ${loc} not found`,
      );
    }
    return configuration;
  }

  async isExist(sec: number, entity: number, build: number, loc: number) {
    return await this.configurationsRepository.exists({
      where: {
        location: {
          id: loc,
          building: {
            id: build,
            entity: { id: entity, section: { id: sec } },
          },
        },
      },
    });
  }

  async countAll() {
    return this.configurationsRepository
      .createQueryBuilder('configuration')
      .select(configCount, 'configCount')
      .addSelect(downCount, 'downCount')
      .addSelect(maCount, 'maCount')
      .addSelect(c24Count, 'c24Count')
      .addSelect(c5Count, 'c5Count')
      .addSelect(c6Count, 'c6Count')
      .getRawOne<{
        configCount: number;
        downCount: number;
        maCount: number;
        c24Count: number;
        c5Count: number;
        c6Count: number;
      }>();
  }

  async snap(data: unknown): Promise<{
    apId: number;
    ipId: number;
    locationId: number;
  } | null> {
    const { vendor, mac, wlc, host, status, ip, ...metrics } = data as {
      vendor: string;
      mac: string;
      wlc: string;
      host: string;
      ip: string;
      status: StatusState;
    } & {
      [key: string]: Metrics;
    };
    // console.dir({ mac, wlc, host, status, ip, metrics }, { depth: null });
    if (ip) {
      const config = await this.configurationsRepository.findOne({
        where: {
          ip: { ip },
        },
        relations: ['ip', 'location', 'accesspoint'],
        select: {
          ip: { id: true },
          location: { id: true },
          accesspoint: { id: true, ethMac: true, radMac: true },
        },
      });
      // console.log(config);
      if (!config) {
        // handle case config not found from ip
        const cond = vendor === 'cisco' ? 'radMac' : 'ethMac';
        const configMac = await this.configurationsRepository.findOne({
          where: {
            accesspoint: { [cond]: mac },
          },
          relations: ['ip', 'location', 'accesspoint'],
        });
        if (configMac) {
          // this case is AP's ip address is not match to expected ip-> mismatch case
          console.error(
            `Mismatch configuration found for MAC ${mac} and IP ${ip}`,
          );
          await this.dataSource.transaction(async (manager) => {
            await manager.update(Configuration, configMac.id, {
              tx: (metrics.tx?.value as bigint) ?? null,
              rx: (metrics.rx?.value as bigint) ?? null,
              client24: (metrics.client24?.value as number) ?? null,
              client5: (metrics.client5?.value as number) ?? null,
              client6: (metrics.client6?.value as number) ?? null,
              channel: (metrics.channel?.value as number) ?? null,
              channel2: (metrics.channel2?.value as number) ?? null,
              status: StatusState.Mismatch,
              mismatchReason: ip,
              wlc: wlc,
            });
            return {
              apId: configMac.accesspoint.id,
              ipId: configMac.ip.id,
              locationId: configMac.location.id,
            };
          });
        } else {
          // ignored case config not found
          console.error(`Configuration not found for MAC ${mac} or IP ${ip}`);
          // create new configuration with
          return null;
        }
      } else if (config.accesspoint) {
        // handle case config found with accesspoint
        const configMac =
          vendor === 'cisco'
            ? config.accesspoint.radMac
            : config.accesspoint.ethMac;
        if (configMac && configMac === mac) {
          // current config is not changed
          await this.configurationsRepository.update(
            {
              id: config.id,
            },
            {
              tx: (metrics.tx?.value as bigint) ?? null,
              rx: (metrics.rx?.value as bigint) ?? null,
              client24: (metrics.client24?.value as number) ?? null,
              client5: (metrics.client5?.value as number) ?? null,
              client6: (metrics.client6?.value as number) ?? null,
              channel: (metrics.channel?.value as number) ?? null,
              channel2: (metrics.channel2?.value as number) ?? null,
              status: config.problem ? StatusState.Maintenance : status,
              mismatchReason: null,
              wlc: wlc,
            },
          );
          return {
            apId: config.accesspoint.id,
            ipId: config.ip.id,
            locationId: config.location.id,
          };
        } else {
          console.warn(
            `Configuration with MAC ${mac} and IP ${ip} has different access point MAC ${configMac}.`,
          );
          // remove old config record and try to create new one
          // if new record is created, it will be returned
          // else return null and handle later ? ignore ?
          await this.dataSource.transaction(async (manager) => {
            const configToRemove = await manager.findOne(Configuration, {
              where: { id: config.id },
              lock: { mode: 'pessimistic_write' },
            });
            if (configToRemove) {
              // create new config with old ip and old location with new ap
              const ap = await this.accesspointsService.getAp(
                manager,
                vendor,
                mac,
                host,
              );
              if (!ap) {
                throw new InternalServerErrorException(
                  `Failed to get or create access point with MAC ${mac} and host ${host}`,
                );
              }
              // check if ap already has configuration
              if (
                await manager.exists(Configuration, {
                  where: { accesspoint: { id: ap } },
                })
              ) {
                throw new ConflictException(
                  `Access point with MAC ${mac} already has configuration`,
                );
              }
              const newConfig = manager.create(Configuration, {
                ...configToRemove,
                ip: { id: configToRemove.ip.id },
                location: { id: configToRemove.location.id },
                accesspoint: { id: ap },
                tx: (metrics.tx?.value as bigint) ?? null,
                rx: (metrics.rx?.value as bigint) ?? null,
                client24: (metrics.client24?.value as number) ?? null,
                client5: (metrics.client5?.value as number) ?? null,
                client6: (metrics.client6?.value as number) ?? null,
                channel: (metrics.channel?.value as number) ?? null,
                channel2: (metrics.channel2?.value as number) ?? null,
                status: configToRemove.problem
                  ? StatusState.Maintenance
                  : status,
                mismatchReason: null,
                wlc: wlc,
              });
              await manager.delete(Configuration, configToRemove);
              await manager.save(newConfig);
              return {
                apId: newConfig.accesspoint.id,
                ipId: newConfig.ip.id,
                locationId: newConfig.location.id,
              };
            } else {
              throw new NotFoundException(
                `Configuration with id ${config.id} not found`,
              );
            }
          });
        }
      } else {
        // handle case config found without accesspoint -> expected to be created new accesspoint record
        await this.dataSource.transaction(async (manager) => {
          const ap = await this.accesspointsService.getAp(
            manager,
            vendor,
            mac,
            host,
          );
          if (!ap) {
            throw new InternalServerErrorException(
              `Failed to get or create access point with MAC ${mac} and host ${host}`,
            );
          }
          if (
            await manager.exists(Configuration, {
              where: { accesspoint: { id: ap } },
            })
          ) {
            throw new ConflictException(
              `Access point with MAC ${mac} already has configuration`,
            );
          }
          await manager.update(Configuration, config.id, {
            tx: (metrics.tx?.value as bigint) ?? null,
            rx: (metrics.rx?.value as bigint) ?? null,
            client24: (metrics.client24?.value as number) ?? null,
            client5: (metrics.client5?.value as number) ?? null,
            client6: (metrics.client6?.value as number) ?? null,
            channel: (metrics.channel?.value as number) ?? null,
            channel2: (metrics.channel2?.value as number) ?? null,
            status: config.problem ? StatusState.Maintenance : status,
            mismatchReason: null,
            wlc: wlc,
            accesspoint: { id: ap },
          });
          return {
            apId: ap,
            ipId: config.ip.id,
            locationId: config.location.id,
          };
        });
      }
    }
    return null;
  }

  async count() {
    return await this.configurationsRepository.count();
  }

  async findClientAp(mac: string) {
    return this.configurationsRepository.findOne({
      where: { accesspoint: { radMac: mac } },
      relations: ['accesspoint', 'location', 'location.building'],
      select: {
        id: true,
        accesspoint: { id: true, name: true },
        location: { id: true, name: true, building: { id: true, name: true } },
      },
    });
  }
}

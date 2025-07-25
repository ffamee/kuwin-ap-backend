import {
  EntitySubscriberInterface,
  EventSubscriber,
  Not,
  UpdateEvent,
} from 'typeorm';
import { Accesspoint } from '../entities/accesspoint.entity';
import { Configuration } from '../../configurations/entities/configuration.entity';
import { ConfigState } from '../../shared/types/define-state';

@EventSubscriber()
export class ConfigurationSubscriber
  implements EntitySubscriberInterface<Accesspoint>
{
  listenTo() {
    return Accesspoint;
  }

  async afterUpdate(event: UpdateEvent<Accesspoint>): Promise<void> {
    if (!event.entity) return;
    const accesspoint = event.entity as Accesspoint;
    const configRepository = event.manager.getRepository(Configuration);

    if (accesspoint && accesspoint.configuration) {
      if (accesspoint.problem !== null) {
        await configRepository.update(
          {
            accesspoint: { id: accesspoint.id },
            state: Not(ConfigState.Maintenance),
          },
          {
            state: ConfigState.Maintenance,
          },
        );
      }
    }
  }
}

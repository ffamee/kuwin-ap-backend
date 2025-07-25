import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { Configuration } from '../entities/configuration.entity';

@EventSubscriber()
export class ConfigurationSubscriber
  implements EntitySubscriberInterface<Configuration>
{
  listenTo() {
    return Configuration;
  }
}

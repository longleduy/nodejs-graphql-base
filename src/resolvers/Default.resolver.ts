import { Mutation, Publisher, PubSub, PubSubEngine, Query, Resolver, Root, Subscription } from 'type-graphql';
import logger from '../utils/Logger.util';

@Resolver()
class DefaultResolver {
  @Query((returns) => String)
  async query(): Promise<string> {
    logger.info('Query demo');
    return 'Query demo';
  }

  @Mutation((returns) => String)
  async mutation(): Promise<string> {
    logger.info('Mutation demo');
    return 'Mutation demo';
  }

  @Subscription((returns) => String, {
    topics: 'MESSAGES',
  })
  subscription(@Root() text: string): string {
    return `Subscription demo-${text}`;
  }

  @Query((returns) => String)
  async queryForSubscription(@PubSub() pubSub: PubSubEngine): Promise<string> {
    await pubSub.publish('MESSAGES', 'Hello World');
    return 'Hello World';
  }

  @Query((returns) => String)
  async shortQuery(@PubSub('MESSAGES') publish: Publisher<String>): Promise<string> {
    await publish(Date.now().toString());
    return Date.now().toString();
  }
}
export { DefaultResolver };

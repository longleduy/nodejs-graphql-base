import { Resolver, Query, Mutation } from 'type-graphql';
import logger from '../utils/Logger.util';

Resolver();
class DefaultResolver {
  @Query((returns) => String)
  async query() {
    logger.info('Query demo');
  }

  @Mutation((returns) => String)
  async mutation() {
    logger.info('Query demo');
  }
}
export { DefaultResolver };

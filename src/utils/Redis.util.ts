import Redis from 'ioredis';
import PromiseBluebird from 'bluebird';
import redisConnect from 'connect-redis';
import express from 'express';
import session from 'express-session';
// Utils
import logger from './Logger.util';
// Constants
import { msgConstant } from '../constants';
// Errors
import RequestTimeOutError from './errors/RequestTimeOutError.error';
import Timeout = NodeJS.Timeout;
interface RedisRequestOption {
  throwError?: boolean;
  defaultResponse?: any;
}

class RedisUtil {
  clientSync!: Redis.Redis | Redis.Cluster;

  client: any;

  RedisStore: redisConnect.RedisStore;

  redisSession: express.RequestHandler;

  constructor() {
    this.connect();
    this.client = PromiseBluebird.promisifyAll(this.clientSync);
    this.RedisStore = redisConnect(session);
    this.redisSession = session({
      secret: process.env.REDIS_SECRET_SESSION_KEY as string,
      resave: false,
      saveUninitialized: false,
      // @ts-ignore
      store: new this.RedisStore({ client: this.clientSync }),
      cookie: {},
    });
    logger.info('Redis Session create!');
  }

  public connect() {
    if ((process.env.REDIS_CLUSTER as string) === '1') {
      const listRedisNode: any[] = JSON.parse(process.env.REDIS_CLUSTER_NODE as string);
      logger.info(listRedisNode);
      this.clientSync = new Redis.Cluster(listRedisNode);
    } else {
      this.clientSync = new Redis({
        port: parseInt(process.env.REDISDB_PORT as string, 10),
        host: process.env.REDISDB_HOST,
        password: process.env.REDIS_PASSWORD,
      });
    }
    logger.info(msgConstant.REDIS_CONNECTING);
    this.clientSync.on('connect', () => {
      logger.info(msgConstant.REDIS_CONNECTED);
    });
    let reconnect = 0;
    this.clientSync.on('error', (err: any) => {
      reconnect += 1;
      logger.info(reconnect);
      logger.error(err.stack);
    });
  }

  public async redisRequest(...arg: any[]) {
    const redisAction: string = arguments[0];
    const option: RedisRequestOption = arguments[1] || {};
    try {
      const paramsArr: any = { ...arguments };
      delete paramsArr[0];
      const params = Object.values(paramsArr);
      let id: Timeout;
      return await new Promise(async (resolve, reject) => {
        try {
          id = setTimeout(() => {
            logger.error(`Redis request ${redisAction} ${params.join()} time out!`);
            reject(new RequestTimeOutError());
          }, Number(1));
          const data = await this.client[redisAction](...params);
          clearTimeout(id);
          resolve(data);
        } catch (e) {
          clearTimeout(id);
          reject(e);
        }
      });
    } catch (e) {
      if (option.throwError === false) {
        logger.error(e.stack || e);
        return option.defaultResponse;
      }
      throw e;
    }
  }
}

export default new RedisUtil();

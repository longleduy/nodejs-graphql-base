import mongoose from 'mongoose';
import mongoConnect from 'connect-mongo';
import session from 'express-session';
import express from 'express';
// Utils
import logger from './Logger.util';
// Constants
import { msgConstant } from '../constants/index';

class MongoUtil {
  mongoSession!: express.RequestHandler;

  projection = '-__v';

  public connect(): void {
    const MONGODB_PATH: string | undefined =
      (process.env.DOCKER_MODE as string) === '1' ? process.env.MONGODB_PATH_DOCKER : process.env.MONGODB_PATH;
    let option: any = { useNewUrlParser: true, useUnifiedTopology: true };
    if ((process.env.DOCKER_MODE as string) === '1') {
      option = {
        auth: {
          authSource: process.env.MONGODB_AUTH_SOURCE,
        },
        user: process.env.MONGODB_USER,
        pass: process.env.MONGODB_PASSWORD,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };
    }
    try {
      const MongoStore = mongoConnect(session);
      logger.info(msgConstant.MONGOOSE_CONNECTING);
      mongoose.set('useCreateIndex', true);
      mongoose.set('useFindAndModify', false);
      mongoose.set('useNewUrlParser', true);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      process.env.MONGO_LOG === '1' &&
        mongoose.set('debug', (collectionName: any, method: any, query: any, doc: any) => {
          logger.info(`MONGODB: ${collectionName}.${method} ${JSON.stringify(query)} ${JSON.stringify(doc)}`);
        });
      mongoose
        .connect(MONGODB_PATH || '', option)
        .then(() => {
          logger.info(`${msgConstant.MONGOOSE_CONNECTED}`);
          mongoose.connection.on('disconnected', () => {
            setTimeout(() => {
              logger.info(msgConstant.MONGOOSE_RECONNECT);
              this.connect();
            }, 2000);
          });
        })
        .catch((err) => {
          logger.error(err.stack);
          setTimeout(() => {
            this.connect();
          }, 2000);
        });
      this.mongoSession = session({
        secret: process.env.MONGO_SESSION_SECRET as string,
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
      });
    } catch (error) {
      logger.error(error.stack);
    }
  }
}
export default new MongoUtil();

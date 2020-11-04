import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

// Utils
import MongoUtil from './utils/Mongo.util';
import RedisUtil from './utils/Redis.util';
class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    MongoUtil.connect();
    RedisUtil.connect();
    this.config();
  }

  private config(): void {
    const urlencodedParser = bodyParser.urlencoded({ limit: '50mb', extended: false });
    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(urlencodedParser);
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_ORIGIN : '*',
        allowedHeaders: [
          'X-Requested-With',
          'X-HTTP-Method-Override',
          'Content-Type',
          'Accept',
          'Authorization',
          'Content-Language',
          'Accept-Language',
          'Language',
        ],
        credentials: true,
        methods: ['POST', 'GET'],
      }),
    );
    this.app.use(RedisUtil.redisSession);
    this.app.use(MongoUtil.mongoSession);
  }
}

export default new App().app;

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import requestIp from 'request-ip';
import DeviceDetector, { DeviceDetectorResult } from 'device-detector-js';
import crypto from 'crypto';
// Models
import Payload from '../models/Payload.model';
import { ISession } from '../models/ISession.model';
import {
  IUserClientData,
  IClientBrowser,
  IClientDevice,
  IClientOs,
  IUserClientDataStore,
} from '../models/users/IUser.model';
// Utils
import AuthenticationError from './errors/AuthenticationError.error';
import RedisUtil from './Redis.util';

const deviceDetector = new DeviceDetector();

class SecureUtil {
  public generateToken = (payload: Payload): string => {
    const payloadObj: object = { ...payload };
    return jwt.sign(payloadObj, process.env.JWT_SECRET_KEY as string, { expiresIn: process.env.JWT_EXPIRE_TIME });
  };

  public hashPassWordAsync = async (password: string): Promise<string> =>
    await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_NUMBER) || 10);

  public comparePassWordAsync = async (passWord: string, passWordHashed: string): Promise<boolean> =>
    await bcrypt.compare(passWord, passWordHashed);

  public async verifyToken(req: Request, res: Response): Promise<void> {
    const sess = req.session as ISession;
    const token: string = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : '';
    try {
      const payload: Payload = (await jwt.verify(token, process.env.JWT_SECRET_KEY as string)) as Payload;
      const isAuth: boolean = payload.username ? payload.username === sess.username && token === sess.token : false;
      if (!isAuth) {
        throw Error();
      }
    } catch (e) {
      if (e.name !== 'TokenExpiredError') {
        throw new AuthenticationError(e);
      }
      // TODO: Kiểm tra thời gian quá hạn token, nếu < 30 phút thi tự sinh ra token mới và trả lại client
      const info: any = await jwt.decode(token);
      const expTime: number = Date.now() - info.exp * 1000;
      if (expTime < 60000 * 30 && info.username === sess.username && token === sess.token) {
        const payload: Payload = new Payload();
        payload.username = info.username;
        const newToken: string = this.generateToken(payload);
        sess.token = newToken;
        res.set('Access-Control-Expose-Headers', 'x-refresh-token');
        res.set('x-refresh-token', newToken);
      } else {
        throw new AuthenticationError(e);
      }
    }
  }

  public getUserClientId(req: Request): string {
    const deviceDetail: DeviceDetectorResult = deviceDetector.parse(req.headers['user-agent'] as string);
    const userClientData: IUserClientData = {
      ip: requestIp.getClientIp(req) as string,
      userAgent: req.headers['user-agent'] as string,
      browser: deviceDetail.client as IClientBrowser,
      os: deviceDetail.os as IClientOs,
      device: deviceDetail.device as IClientDevice,
    };
    const hashUserClientData: string = crypto.createHash('sha256').update(JSON.stringify(userClientData)).digest('hex');
    return hashUserClientData;
  }

  public async verifyTokenWithoutSession(req: Request, res: Response): Promise<void> {
    const userClientId = this.getUserClientId(req);
    const userClientDataString: string = await RedisUtil.client.get(userClientId);
    if (!userClientDataString) {
      throw new Error('Please Login');
    }
    const userClientData: IUserClientDataStore = JSON.parse(userClientDataString);
    const token: string = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : '';
    try {
      const payload: Payload = (await jwt.verify(token, process.env.JWT_SECRET_KEY as string)) as Payload;
      const isAuth: boolean = payload.username
        ? payload.username === userClientData.username && token === userClientData.token
        : false;
      if (!isAuth) {
        throw Error('Please Login');
      }
    } catch (e) {
      if (e.name !== 'TokenExpiredError') {
        throw new AuthenticationError(e);
      }
      // TODO: Kiểm tra thời gian quá hạn token, nếu < 30 phút thi tự sinh ra token mới và trả lại client
      const info: any = await jwt.decode(token);
      const expTime: number = Date.now() - info.exp * 1000;
      if (expTime < 60000 * 30 && info.username === userClientData.username && token === userClientData.token) {
        const payload: Payload = new Payload();
        payload.username = info.username;
        const newToken: string = this.generateToken(payload);
        userClientData.token = newToken;
        await RedisUtil.client.set(userClientId, JSON.stringify(userClientData));
        res.set('Access-Control-Expose-Headers', 'x-refresh-token');
        res.set('x-refresh-token', newToken);
      } else {
        throw new AuthenticationError(e);
      }
    }
  }

  public async getUsernameFromToken(req: Request): Promise<string> {
    const token: string = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : '';
    try {
      const payload: Payload = (await jwt.verify(token, process.env.JWT_SECRET_KEY as string)) as Payload;
      const { username } = payload;
      return username;
    } catch (e) {
      const payload: any = await jwt.decode(token);
      return payload.username;
    }
  }
}
export default new SecureUtil();

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
// Models
import Payload from '../models/Payload.model';
import { ISession } from '../models/ISession.model';
// Utils
import AuthenticationError from './errors/AuthenticationError.error';

dotenv.config();
class SecureUtil {
  public generateToken = (payload: Payload): string => {
    const payloadObj: object = { ...payload };
    return jwt.sign(payloadObj, process.env.JWT_SECRET_KEY as string, { expiresIn: process.env.JWT_EXPIRE_TIME });
  };

  public hashPassWordAsync = async (password: string): Promise<string> => await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_NUMBER) || 10);

  public comparePassWordAsync = async (passWord: string, passWordHashed: string): Promise<boolean> => await bcrypt.compare(passWord, passWordHashed);

  public async verifyToken(req: Request, res: Response, rule?: string[]): Promise<void> {
    const sess = req.session as ISession;
    // @ts-ignore
    const token: string = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : '';
    try {
      const payload: Payload = await jwt.verify(token, process.env.JWT_SECRET_KEY as string) as Payload;
      // FIXME: Update logic verify
      let isAuth = false;
      if (payload.username) {
        isAuth = payload.username === sess.username && token === sess.token;
      }
      if (!isAuth) {
        throw Error();
      }
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        // TODO: Kiểm tra thời gian quá hạn token, nếu < 30 phút thi tự sinh ra token mới và trả lại client
        const info: any = await jwt.decode(token);
        const expTime: number = Date.now() - info.exp * 1000;
        if (expTime < 60000 * 30 && info.username === sess.username && token === sess.token) {
          const payload: Payload = new Payload();
          payload.username = info.username;
          const newToken: string = await this.generateToken(payload);
          sess.token = newToken;
          res.set('Access-Control-Expose-Headers', 'x-refresh-token');
          res.set('x-refresh-token', newToken);
        } else {
          throw new AuthenticationError(e);
        }
      } else {
        throw new AuthenticationError(e);
      }
    }
  }
}
export default new SecureUtil();

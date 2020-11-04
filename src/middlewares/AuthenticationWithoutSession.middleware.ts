import { MiddlewareFn } from 'type-graphql';
import { Request, Response } from 'express';
// Utils
import SecureUtil from '../utils/Secure.util';
//Models
import ContextInfo from '../models/Context.model';

export const AuthenticationMiddleware: MiddlewareFn = async ({ context, info }, next) => {
  const ctx = context as ContextInfo;
  const req = ctx.req as Request;
  const res = ctx.res as Response;
  await SecureUtil.verifyTokenWithoutSession(req, res);
  return next();
};

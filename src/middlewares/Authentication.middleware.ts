import { MiddlewareFn } from 'type-graphql';
import { Request, Response } from 'express';
import SecureUtil from '../utils/Secure.util';
import ContextInfo from '../models/Context.model';

export const AuthenticationMiddleware: MiddlewareFn = async ({ context, info }, next) => {
  const ctx = context as ContextInfo;
  const req = ctx.req as Request;
  const res = ctx.res as Response;
  await SecureUtil.verifyToken(req, res);
  return next();
};

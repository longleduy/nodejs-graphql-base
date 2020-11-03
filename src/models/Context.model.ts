import { Request, Response } from 'express';

class ContextInfo {
  requestID: string;

  req: Request;

  res: Response;
}
export default ContextInfo;

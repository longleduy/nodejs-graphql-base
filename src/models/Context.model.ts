import { Response } from 'express';
import { IRequest } from './IRequest.model';

class ContextInfo {
  requestID: string;
  req: IRequest;
  res: Response;
}
export default ContextInfo;

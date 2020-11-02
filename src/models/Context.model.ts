import { Request } from 'express';

class ContextInfo {
  requestID: string;

  req: Request;
}
export default ContextInfo;

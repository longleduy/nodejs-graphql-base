import ArgumentErrorInfo from './ArgumentErrorInfo.model';

class ErrorResponse {
  message: string;

  code?: string;

  info?: ArgumentErrorInfo[];
}
export default ErrorResponse;

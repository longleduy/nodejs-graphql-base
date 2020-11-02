import { GraphQLError } from 'graphql';
// Constant
import { errorConstant } from '../constants/index';
// Models
import ErrorResponse from '../models/errors/ErrorResponse.model';
import ArgumentErrorInfo from '../models/errors/ArgumentErrorInfo.model';

class ErrorUtil {
  generateErrorInfo(error: GraphQLError): ErrorResponse {
    const errorInfo = new ErrorResponse();
    // @ts-ignore
    errorInfo.message = error.extensions.role === 1 || error.extensions.code === 'GRAPHQL_VALIDATION_FAILED' ? error.message : errorConstant.SERVER_ERROR;
    // @ts-ignore
    errorInfo.code = error.extensions.code;
    if (error.message === 'Argument Validation Error' && error.extensions?.exception.validationErrors) {
      errorInfo.code = 'ARGUMENT_INVALID';
      errorInfo.message = error.message;
      const listArgumentError: ArgumentErrorInfo[] = [];
      error.extensions?.exception.validationErrors.forEach((info: any) => {
        const argumentErrorInfo = new ArgumentErrorInfo();
        argumentErrorInfo.error_field = info.property;
        argumentErrorInfo.error_messages = Object.values(info.constraints);
        listArgumentError.push(argumentErrorInfo);
      });
      errorInfo.info = listArgumentError;
    }
    return errorInfo;
  }
}
export default new ErrorUtil();

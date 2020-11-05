import { MiddlewareFn } from 'type-graphql';
import logger from '../utils/Logger.util';
import ContextInfo from '../models/Context.model';

export const LogAccess: MiddlewareFn = ({ context, info }, next) => {
  const listField: string[] = [];
  const { path } = info;
  const params: string[] = [];
  const ctx = context as ContextInfo;
  info.fieldNodes[0].arguments?.forEach((data) => {
    if ('value' in data.value) {
      const vl = data.value.kind === 'StringValue' ? `"${data.value.value}"` : data.value.value;
      params.push(`${data.name.value}: ${vl}`);
    }
  });
  info.fieldNodes[0].selectionSet?.selections.forEach((data) => {
    if ('name' in data) {
      listField.push(data.name.value);
    }
  });
  const logInfo = `REQUEST ${
    ctx.requestID
  } GRAPHQL_${path.typename?.toUpperCase()}: ${path.typename?.toLocaleLowerCase()}{${path.key}${
    params.length > 0 ? `(${params.join()})` : ''
  }{${listField.join()}}}`;
  logger.info(logInfo);
  return next();
};

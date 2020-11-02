import { ApolloError } from 'apollo-server-express';

export default class CustomizeError extends ApolloError {
  constructor(message: string, code?: string) {
    super(message, code || 'SERVER_ERROR', { role: 1 });
  }
}

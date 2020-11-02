import { ApolloError } from 'apollo-server-express';

export default class DefaultError extends ApolloError {
  constructor(message?: string) {
    super(message || 'Internal server error', 'SERVER_ERROR');
  }
}

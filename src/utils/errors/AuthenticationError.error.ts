import { ApolloError } from 'apollo-server-express';

export default class AuthenticationError extends ApolloError {
  constructor(message?: string, code?: string) {
    super(message || 'Authenticate fail', code || 'AUTHENTICATION_ERROR', { role: 1 });
  }
}

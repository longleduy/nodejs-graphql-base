import 'regenerator-runtime/runtime';
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { ApolloServerPluginUsageReporting } from 'apollo-server-core';
import app from './app';
// Utils
import logger from './utils/Logger.util';
import ErrorUtil from './utils/Error.util';
// Resolvers
import rootResolver from './resolvers';
// Models
import ContextInfo from './models/Context.model';

const PORT = Number(process.env.PORT) || 4000;
const BASIC_LOGGING = {
  requestDidStart(requestContext: any) {
    const { requestID } = requestContext.context;
    const { query } = requestContext.request;
    if (['mut', 'que', 'sub'].includes(query.substring(0, 3))) {
      logger.info(`REQUEST ${requestID} GRAPHQL ${requestContext.request.query}`);
      return {
        parsingDidStart(requestContext: any) {
          logger.info(`REQUEST ${requestID} Parsing started!`);
        },
      };
    }
  },
};

const start = async () => {
  const schema = await buildSchema({
    resolvers: rootResolver,
    emitSchemaFile: true,
  });
  let requestID: string;
  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      BASIC_LOGGING,
      ApolloServerPluginUsageReporting({
        sendVariableValues: { all: true },
      }),
    ],
    context: async ({ req, res }) => {
      requestID = Math.random().toString(36).substring(7).toUpperCase() + Date.now().toString();
      const context = new ContextInfo();
      context.requestID = requestID;
      context.req = req;
      context.res = res;
      return context;
    },
    formatError: (error) => {
      logger.error(`REQUEST ${requestID} ${JSON.stringify(error)}`);
      if (process.env.NODE_ENV !== 'production') return error;
      return ErrorUtil.generateErrorInfo(error);
    },
    playground: process.env.NODE_ENV !== 'production',
    introspection: process.env.NODE_ENV !== 'production',
  });
  apolloServer.applyMiddleware({ app, cors: false });
  app.listen({ port: PORT });
};

start().then(() => {
  logger.info(`Apollo Server on ${process.env.HOST}`);
});

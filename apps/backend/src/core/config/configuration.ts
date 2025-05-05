import { NodeEnv } from './enums/node-env.enum';

/**
 * Configuration factory function that returns a configuration object based on environment
 */
export default () => {
  const environment = process.env.NODE_ENV || NodeEnv.Dev;

  // Base configuration shared across all environments
  const baseConfig = {
    environment,
    isProduction: environment === (NodeEnv.Prod as string),
    isStaging: environment === (NodeEnv.Staging as string),
    isDevelopment: environment === (NodeEnv.Dev as string),

    app: {
      name: process.env.APP_NAME || 'Motorove API',
      port: parseInt(process.env.PORT || '3000', 10),
      host: process.env.HOST || '0.0.0.0',
      apiPrefix: process.env.API_PREFIX || 'api',
      corsOrigin: process.env.CORS_ORIGIN || '*',
      swaggerEnable: process.env.SWAGGER_ENABLE === 'true',
    },

    database: {
      url: process.env.DATABASE_URL,
    },

    auth: {
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiration: process.env.JWT_EXPIRATION || '1d',
    },

    sentry: {
      dsn: process.env.SENTRY_DSN,
    },
  };

  // Environment-specific overrides
  // const envConfigs = {
  //   [NodeEnv.Dev]: {
  //     app: {
  //       swaggerEnable: true,
  //     },
  //     logging: {
  //       level: 'debug',
  //       prettyPrint: true,
  //     },
  //   },

  //   [NodeEnv.Staging]: {
  //     app: {
  //       swaggerEnable: true,
  //     },
  //     logging: {
  //       level: 'info',
  //       prettyPrint: false,
  //     },
  //   },

  //   [NodeEnv.Prod]: {
  //     app: {
  //       swaggerEnable: false,
  //     },
  //     logging: {
  //       level: 'warn',
  //       prettyPrint: false,
  //     },
  //   },
  // };

  // Merge base config with environment-specific config
  return {
    ...baseConfig,
    // ...envConfigs[environment as keyof typeof envConfigs],
  } as const;
};

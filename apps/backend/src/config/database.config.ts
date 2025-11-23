import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DATABASE_HOST'),
  port: configService.get('DATABASE_PORT'),
  username: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_NAME'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false, // Always use migrations in production
  logging: configService.get('NODE_ENV') === 'development',
  migrationsRun: false, // Run migrations manually

  // Connection pool optimization
  extra: {
    // Maximum number of clients in the pool
    max: parseInt(configService.get('DATABASE_POOL_MAX') || '20', 10),
    // Minimum number of clients in the pool
    min: parseInt(configService.get('DATABASE_POOL_MIN') || '5', 10),
    // Maximum time (ms) a client can be idle before being removed
    idleTimeoutMillis: 30000,
    // Maximum time (ms) to wait for a connection
    connectionTimeoutMillis: 2000,
    // Enable statement timeout to prevent long-running queries
    statement_timeout: 30000,
    // Enable query timeout
    query_timeout: 30000,
    // Application name for monitoring
    application_name: 'recruiting-platform',
  },
});

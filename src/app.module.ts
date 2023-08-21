import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { PrismaService } from './prisma.service';
import { CustomerModule } from './domain/customer/customer.module';
import { AuthModule } from './domain/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './domain/auth/guards/accessToken.guard';
import { RoleGuard } from './domain/auth/guards/role.guard';

@Module({
  imports: [
    AuthModule,
    CustomerModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      buildSchemaOptions: {
        dateScalarMode: 'timestamp',
      },
      context: ({ request, reply }) => ({ request, reply }),
      playground: true,
      introspection: false, // TODO update this so that it's off in production;
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
  ],
})
export class AppModule {}

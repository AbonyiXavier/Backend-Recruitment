import {
  INestApplication,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    this.$use(this.postSoftDeleteMiddleware);
    this.$use(this.postFindMiddleware);
  }

  /***
   * middleware function for every time a Customer record is soft deleted. We need to change a delete action into the update action and provide the appropriate date
   */
  postSoftDeleteMiddleware: Prisma.Middleware = async (params, next) => {
    if (params.model !== 'Customer') {
      return next(params);
    }
    if (params.action === 'delete') {
      return next({
        ...params,
        action: 'update',
        args: {
          ...params.args,
          data: {
            deletedAt: new Date(),
          },
        },
      });
    }
    return next(params);
  };

  /***
   * filters out removed Customers whenever we fetch them. We need to handle fetching a single Customer and fetching multiple Customers separately.
   */
  postFindMiddleware: Prisma.Middleware = async (params, next) => {
    if (params.model !== 'Customer') {
      return next(params);
    }
    if (params.action === 'count') {
      return next({
        ...params,
        action: 'count',
        args: {
          ...params.args,
          where: {
            ...params.args?.where,
            deletedAt: null,
          },
        },
      });
    }

    if (params.action === 'findUnique' || params.action === 'findFirst') {
      return next({
        ...params,
        action: 'findFirst',
        args: {
          ...params.args,
          where: {
            ...params.args?.where,
            deletedAt: null,
          },
        },
      });
    }

    if (params.action === 'findMany') {
      return next({
        ...params,
        args: {
          ...params.args,
          where: {
            ...params.args?.where,
            deletedAt: null,
          },
        },
      });
    }
    return next(params);
  };

  async onModuleDestroy() {
    await this.$disconnect();
  }
  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayloadWithRefreshedToken } from '../../domain/auth/types/auth.types';

export const CurrentCustomer = createParamDecorator(
  (
    data: keyof JwtPayloadWithRefreshedToken | undefined,
    context: ExecutionContext,
  ) => {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    if (data) {
      return req.user[data];
    }

    return req.user;
  },
);

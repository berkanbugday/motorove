import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

interface GqlContext {
  req: {
    accessToken?: string;
  };
}

export const AccessToken = createParamDecorator(
  (data: unknown, context: ExecutionContext): string | undefined => {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext<GqlContext>();
    return req.accessToken;
  },
);

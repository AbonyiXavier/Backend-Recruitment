import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  AuthResponseOutput,
  ICustomer,
} from '../../../../dto/output/auth.response.output';
import { Public } from '../../../../../../common/decorators/public.decorator';
import { SignInInput } from '../../../../dto/input/signin.input';
import { SignUpInput } from '../../../../dto/input/signup.input';
import { LogoutResponseOutput } from '../../../../dto/output/logout.response.output';
import { NewTokenResponseOutput } from '../../../../dto/output/newToken.response.output';
import { RefreshTokenGuard } from '../../../../guards/refreshToken.guard';
import { AuthService } from '../../../../services/auth.service';
import { CurrentCustomer } from '../../../../../../common/decorators/currentCustomer.decorator';
import { CurrentCustomerId } from '../../../../../../common/decorators/currentCustomerId.decorator';
import { ActivateCodeInput } from '../../../../dto/input/activatieCode.input';

@Resolver(() => AuthResponseOutput)
export class AuthMutationResolver {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Mutation(() => AuthResponseOutput, {
    name: 'signUp',
    description: 'SignUp a customer',
  })
  async signUp(@Args('input') signUpInput: SignUpInput) {
    const [response, error] = await this.authService.signUp(signUpInput);

    if (error) {
      throw error;
    }

    return response;
  }
  @Public()
  @Mutation(() => AuthResponseOutput, {
    name: 'signIn',
    description: 'Sign in a customer',
  })
  async signIn(@Args('input') signInInput: SignInInput) {
    const [response, error] = await this.authService.signIn(signInInput);

    if (error) {
      throw error;
    }

    return response;
  }

  @Public()
  @Mutation(() => ICustomer, {
    name: 'confirmActivationCode',
    description: 'confirm activation cod',
  })
  async confirmEmailActivationCode(@Args('input') props: ActivateCodeInput) {
    const [response, error] = await this.authService.confirmActivationCode(
      props,
    );

    if (error) {
      throw error;
    }

    return response;
  }

  @Mutation(() => LogoutResponseOutput, {
    name: 'logOut',
    description: 'Log out a customer',
  })
  async logout(@Args('id') id: string) {
    return await this.authService.logout(id);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Mutation(() => NewTokenResponseOutput, {
    name: 'getNewTokens',
    description: 'Get new tokens for a customer when accessToken expires',
  })
  async getNewTokens(
    @CurrentCustomerId() customerId: string,
    @CurrentCustomer('refreshToken') refreshToken: string,
  ) {
    const [response, error] = await this.authService.getNewTokens(
      customerId,
      refreshToken,
    );

    if (error) {
      throw error;
    }

    return response;
  }
}

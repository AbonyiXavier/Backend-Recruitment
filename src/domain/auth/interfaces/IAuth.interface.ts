import { HttpException } from '@nestjs/common';
import { SignInInput } from '../dto/input/signin.input';
import { SignUpInput } from '../dto/input/signup.input';
import { AuthResponseOutput } from '../dto/output/auth.response.output';
import { LogoutResponseOutput } from '../dto/output/logout.response.output';
import { ICreateTokens } from '../types/auth.types';
import { Customer } from '../../customer/types/customer.types';

export interface IAuthService {
  signUp(input: SignUpInput): Promise<[AuthResponseOutput, HttpException]>;
  signIn(input: SignInInput): Promise<[AuthResponseOutput, HttpException]>;
  createTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<ICreateTokens>;
  updateRefreshedToken(userId: string, refreshedToken: string): Promise<void>;
  logout(userId: string): Promise<LogoutResponseOutput>;
  validateEmailExist(usernameOrEmail: string): Promise<Customer>;
  getNewTokens(
    customerId: string,
    rt: string,
  ): Promise<[AuthResponseOutput, HttpException]>;
  checkDuplicateEmail(userName: string, email: string): Promise<void>;
}

import { MailerService, ISendMailOptions } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EnvConfig, envConfig } from '../../common/configs/env.configs';

type MailOptions = ISendMailOptions & { template?: string };

@Injectable()
export class EmailService {
  private _env: EnvConfig;
  constructor(private mailer: MailerService) {
    this._env = envConfig();
  }

  send(options: MailOptions) {
    return this.mailer.sendMail(options);
  }

  public async sendEmailActivationCode(
    toEmail: string,
    code: number,
  ): Promise<void> {
    try {
      await this.send({
        to: toEmail, // List of receiver(s) email address
        from: envConfig().email.emailSender, // Senders email address
        subject: 'Verify your account with activation code',
        template: 'email-activate-code',
        context: {
          activationCode: code,
        },
      });
    } catch (error) {
      console.log('sendEmailActivationCode failed', error);
    }
  }
}

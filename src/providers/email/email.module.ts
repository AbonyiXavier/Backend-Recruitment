import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sendGridTransport = require('nodemailer-sendgrid-transport');
import { EmailService } from './email.service';
import { envConfig } from '../../common/configs/env.configs';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: sendGridTransport({
        auth: {
          api_key: envConfig().email.sendgridApiKey,
        },
      }),
      defaults: {
        from: `"No Reply" <noreply@recruitment.com>`,
      },
      // preview: envConfig().mode === 'development',
      template: {
        dir: process.cwd() + '/src/providers/email/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          extension: '.hbs', // Specify the extension here
          strict: true,
        },
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

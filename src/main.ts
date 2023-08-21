import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  process.env.DATABASE_URL = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?schema=${process.env.DB_SCHEMA}&sslmode=prefer`;
  process.env.SHADOW_DATABASE_URL = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?schema=dbmigration&sslmode=prefer`;

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    cors: true,
  });

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  const config = new DocumentBuilder()
    .setTitle('Service Example')
    .setDescription('Service that can be used for boiler plating')
    .setVersion('1.0')
    .addTag('example')
    .addTag('default')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  await app.listen(8080, () => {
    Logger.log(`Service is running at: http://localhost:8080`);
  });
}
bootstrap();

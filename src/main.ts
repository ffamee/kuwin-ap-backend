import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    // origin: true,
    credentials: true,
  });
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('AP monitor example')
    .setDescription('AP monitor API description')
    .setVersion('1.0')
    .addTag('AP-monitor')
    .addCookieAuth('accessToken', { type: 'apiKey' })
    .addCookieAuth('refreshToken', { type: 'apiKey' })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.set('trust proxy', 'loopback'); // Trust the first proxy (e.g., if behind a reverse proxy like Nginx)
  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT') ?? 3001);
  // await app.listen(configService.get('PORT') ?? 3001, '0.0.0.0');
}
bootstrap().catch((err) => {
  console.error('Error starting the application:', err);
});

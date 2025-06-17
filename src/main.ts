import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
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

  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT') ?? 3001);
}
bootstrap().catch((err) => {
  console.error('Error starting the application:', err);
});

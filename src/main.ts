import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Trust the first proxy hop (required for correct IP behind ingress/load balancer)
  app.set('trust proxy', 1);

  // Standard HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)
  app.use(helmet());

  app.enableCors();

  // Restrict JSON body size to 1 MB — does NOT affect Multer multipart uploads
  // (Multer reads the raw stream directly, bypassing express.json())
  app.use(json({ limit: '1mb' }));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  if (process.env.PRODUCTION !== 'true') {
    const config = new DocumentBuilder()
      .setTitle('Auth-Pro API')
      .setDescription('The Auth-Pro API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

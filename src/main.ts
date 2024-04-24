import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { generateClientOptions } from './generate-client-options';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { snapshot: true });

  // Use ConfigService to access environment variables
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT', 3000);
  const API_VERSION = configService.get<string>('API_VERSION', 'v1');

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(`api/${API_VERSION}`, {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  const { documentBuilder, swaggerOptions } =
    generateClientOptions(API_VERSION);

  // ? In order to create a full document (with all HTTP routes defined)
  // ? we use the createDocument() method of the SwaggerModule class
  const document = SwaggerModule.createDocument(
    app,
    documentBuilder.build(),
    swaggerOptions,
  );
  SwaggerModule.setup(`${API_VERSION}/api-docs`, app, document);

  await app.listen(PORT);
  Logger.log(`Application is running on: http://localhost:${PORT}`);
}
// ? this is called by nest start
bootstrap();

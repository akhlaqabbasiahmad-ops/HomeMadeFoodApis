import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for React Native app
  app.enableCors({
    origin: [
      'http://localhost:8081', 
      'http://localhost:8082', 
      'exp://192.168.1.3:8081',
      'exp://192.168.1.3:8082', 
      'http://localhost:3000',
      'http://192.168.1.3:8081',
      'http://192.168.1.3:8082',
      'http://192.168.1.6:8081',
      'http://192.168.1.6:8082'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('HomeMadeFood API')
    .setDescription('The HomeMadeFood App API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  const host = '0.0.0.0'; // Bind to all interfaces to allow IP access
  
  await app.listen(port, host);
  
  console.log(`🚀 Application is running on:`);
  console.log(`   - Local: http://localhost:${port}`);
  console.log(`   - Network: http://192.168.1.3:${port}`);
  console.log(`📚 API Documentation:`);
  console.log(`   - Local: http://localhost:${port}/api/docs`);
  console.log(`   - Network: http://192.168.1.3:${port}/api/docs`);
}

bootstrap();
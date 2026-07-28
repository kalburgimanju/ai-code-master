import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }));
  app.enableCors();
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`🚀 Student WhatsApp CRM backend listening on http://localhost:${port}`);
  console.log(`   WhatsApp provider: ${process.env.WHATSAPP_PROVIDER ?? 'mock'}`);
  console.log(`   AI provider: ${process.env.AI_PROVIDER ?? 'mock'}`);
  console.log(`   Payment provider: ${process.env.PAYMENT_PROVIDER ?? 'mock'}`);
}
bootstrap();

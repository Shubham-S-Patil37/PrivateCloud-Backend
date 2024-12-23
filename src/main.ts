import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectDB } from 'database/db';

async function bootstrap() {

  connectDB();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT);

}
bootstrap();

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SourceModule } from './source/source.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { IaModule } from './ia/ia.module';
import { ConfigModule } from '@nestjs/config';
import { IaService } from './ia/ia.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SourceModule,
    WhatsappModule,
    IaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

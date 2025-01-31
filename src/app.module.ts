import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SourceModule } from './source/source.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { IaModule } from './ia/ia.module';
import { IaService } from './ia/ia.service';

@Module({
  imports: [SourceModule, WhatsappModule, IaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

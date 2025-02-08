import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SourceModule } from './source/source.module';
import { IaModule } from './ia/ia.module';
import { ConfigModule } from '@nestjs/config';
import { WaModule } from './wa/wa.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WaModule,
    SourceModule,
    IaModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrintingService } from './printing.service';
import { PrintingController } from './printing.controller';
import { AuthModule } from '../auth/auth.module';
import { File } from '../files/entities/file.entity';
import { Patient } from '../patients/entities/patient.entity';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    AuthModule,
    TypeOrmModule.forFeature([File, Patient]),
  ],
  controllers: [PrintingController],
  providers: [PrintingService],
  exports: [PrintingService],
})
export class PrintingModule {}

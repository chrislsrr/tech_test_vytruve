import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { User } from './users/entities/user.entity';
import { PatientsModule } from './patients/patients.module';
import { Patient } from './patients/entities/patient.entity';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { File } from './files/entities/file.entity';
import { PrintingModule } from './printing/printing.module';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // TypeORM configuration with SQLite
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get('DB_PATH', './database.sqlite'),
        entities: [User, Patient, File],
        synchronize: true, // For development only
        logging: true,
      }),
    }),
    HttpModule,
    UsersModule,
    PatientsModule,
    AuthModule,
    FilesModule,
    PrintingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

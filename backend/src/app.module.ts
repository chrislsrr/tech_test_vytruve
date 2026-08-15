import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { PatientsModule } from './patients/patients.module';
import { Patient } from './patients/entities/patient.entity';
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
        entities: [User, Patient],
        synchronize: true, // For development only
        logging: true,
      }),
    }),
    UsersModule,
    PatientsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

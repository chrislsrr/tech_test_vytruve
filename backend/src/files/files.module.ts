import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { File } from './entities/file.entity';
import { Patient } from '../patients/entities/patient.entity';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, Patient]),
    AuthModule,
    MulterModule.register({
      // Use memory storage to have access to file.buffer
      storage: undefined,
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit
      },
      fileFilter: (req, file, cb) => {
        // Only allow .ply files
        const ext = extname(file.originalname).toLowerCase();
        if (ext === '.ply') {
          cb(null, true);
        } else {
          cb(new Error('Only .ply files are allowed!'), false);
        }
      },
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../users/entities/user.entity';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

// Interface for uploaded file from Multer
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class FilesService {
  private readonly UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'patients');

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {
    // Ensure uploads directory exists
    this.ensureUploadsDirectory();
  }

  private ensureUploadsDirectory(): void {
    const baseDir = path.join(__dirname, '..', '..', 'uploads');
    const patientsDir = path.join(baseDir, 'patients');
    
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    if (!fs.existsSync(patientsDir)) {
      fs.mkdirSync(patientsDir, { recursive: true });
    }
  }

  private generateStoredFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const basename = path.basename(originalName, ext);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(4).toString('hex');
    return `${timestamp}_${randomString}_${basename}${ext}`;
  }

  private async verifyPatientOwnership(patientId: number, user: User): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId, user: { id: user.id } },
    });
    
    if (!patient) {
      throw new ForbiddenException(
        `Patient with ID ${patientId} does not belong to user`,
      );
    }
    return patient;
  }

  async uploadFile(
    patientId: number,
    file: MulterFile,
    user: User,
  ): Promise<File> {
    // Verify patient ownership
    const patient = await this.verifyPatientOwnership(patientId, user);

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Generate stored filename
    const storedName = this.generateStoredFilename(file.originalname);
    const patientUploadDir = path.join(this.UPLOADS_DIR, String(patientId));
    const filePath = path.join(patientUploadDir, storedName);

    // Ensure patient directory exists
    if (!fs.existsSync(patientUploadDir)) {
      fs.mkdirSync(patientUploadDir, { recursive: true });
    }

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    // Create file record
    const newFile = this.fileRepository.create({
      originalName: file.originalname,
      storedName,
      filePath: path.relative(path.join(__dirname, '..', '..'), filePath),
      fileType: path.extname(file.originalname).replace('.', ''),
      fileSize: file.size,
      patient,
    });

    return await this.fileRepository.save(newFile);
  }

  async getFilesByPatient(patientId: number, user: User): Promise<File[]> {
    // Verify patient ownership
    await this.verifyPatientOwnership(patientId, user);

    return await this.fileRepository.find({
      where: { patient: { id: patientId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getFile(fileId: number, user: User): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { 
        id: fileId,
        patient: { user: { id: user.id } }
      },
      relations: ['patient'],
    });
    
    if (!file) {
      throw new ForbiddenException(
        `File with ID ${fileId} does not belong to user`,
      );
    }
    return file;
  }

  async deleteFile(patientId: number, fileId: number, user: User): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { 
        id: fileId,
        patient: { id: patientId, user: { id: user.id } }
      },
      relations: ['patient'],
    });
    
    if (!file) {
      throw new ForbiddenException(
        `File with ID ${fileId} does not belong to patient ${patientId} or user`,
      );
    }

    // Delete file from filesystem
    const absolutePath = path.join(__dirname, '..', '..', file.filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    // Delete file record
    await this.fileRepository.remove(file);
  }
}

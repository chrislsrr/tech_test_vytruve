import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import { PrintJob } from './interfaces/print-job.interface';
import { File } from '../files/entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class PrintingService {
  private readonly vytruveApiUrl: string;
  private readonly vytruveApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {
    this.vytruveApiUrl = this.configService.get<string>('VYTRUVE_API_URL') || 'http://localhost:3001';
    this.vytruveApiKey = this.configService.get<string>('VYTRUVE_API_KEY') || '';
  }

  private async verifyPatientOwnership(patientId: number, user: User): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId, user: { id: user.id } },
    });
    
    if (!patient) {
      throw new NotFoundException(
        `Patient with ID ${patientId} not found or does not belong to user`,
      );
    }
    return patient;
  }

  private async getFileById(fileId: number, patientId: number, user: User): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { 
        id: fileId,
        patient: { id: patientId, user: { id: user.id } }
      },
      relations: ['patient'],
    });
    
    if (!file) {
      throw new NotFoundException(
        `File with ID ${fileId} not found or does not belong to patient ${patientId}`,
      );
    }
    return file;
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'api-key': `${this.vytruveApiKey}`,
    };
  }

  /**
   * Health check for the Vytruve API
   */
  async healthCheck(): Promise<string> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.vytruveApiUrl}/`, {
        headers: this.getAuthHeaders(),
      }),
    );
    return response.data;
  }

  /**
   * Start a new print job using an already uploaded file
   * @param fileId - ID of the file to print
   * @param patientId - ID of the patient who owns the file
   * @param socketReference - Your reference for the target socket/slot (max 15 chars)
   * @param user - The authenticated user
   * @returns The created print job
   */
  async startPrintJob(fileId: number, patientId: number, socketReference: string, user: User): Promise<PrintJob> {
    // Verify patient and file ownership
    await this.verifyPatientOwnership(patientId, user);
    const file = await this.getFileById(fileId, patientId, user);

    if (!socketReference || socketReference.length > 15) {
      throw new BadRequestException('socketReference is required and must be max 15 characters');
    }

    // Get the full path to the file
    // file.filePath is relative to project root (e.g., 'uploads/patients/1/filename.ply')
    const absoluteFilePath = path.join(__dirname, '..', '..','..', file.filePath);
    
    if (!fs.existsSync(absoluteFilePath)) {
      throw new NotFoundException(`File not found on disk: ${file.originalName}`);
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(absoluteFilePath), {
      filename: file.originalName,
      contentType: 'application/octet-stream',
    });
    formData.append('socketReference', socketReference);

    const response = await firstValueFrom(
      this.httpService.post(`${this.vytruveApiUrl}/printing`, formData, {
        headers: {
          ...formData.getHeaders(),
          ...this.getAuthHeaders(),
        },
      }),
    );

    return response.data as PrintJob;
  }

  /**
   * List all print jobs
   * @returns Array of all print jobs
   */
  async listPrintJobs(): Promise<PrintJob[]> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.vytruveApiUrl}/printing`, {
        headers: this.getAuthHeaders(),
      }),
    );
    return response.data as PrintJob[];
  }

  /**
   * Get a print job by its ID
   * @param id - The job ID (UUID)
   * @returns The print job
   */
  async getPrintJobById(id: string): Promise<PrintJob> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.vytruveApiUrl}/printing/${id}`, {
          headers: this.getAuthHeaders(),
        }),
      );
      return response.data as PrintJob;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`Print job with ID ${id} not found`);
      }
      throw error;
    }
  }

  /**
   * Get a print job by its socket reference
   * @param reference - The socket reference
   * @returns The job ID as a bare string
   */
  async getPrintJobByReference(reference: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.vytruveApiUrl}/printing/reference/${reference}`, {
          headers: this.getAuthHeaders(),
        }),
      );
      return response.data as string;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`Print job with reference ${reference} not found`);
      }
      throw error;
    }
  }
}

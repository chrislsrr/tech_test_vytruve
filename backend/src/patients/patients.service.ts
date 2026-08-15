import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient } from './entities/patient.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(
    createPatientDto: CreatePatientDto,
    user: User,
  ): Promise<Patient> {
    const patient = this.patientRepository.create({
      ...createPatientDto,
      user,
    });
    return await this.patientRepository.save(patient);
  }

  async findAll(user: User): Promise<Patient[]> {
    return await this.patientRepository.find({
      where: { user: { id: user.id } },
    });
  }

  async findOne(id: number, user: User): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!patient) {
      throw new NotFoundException(
        `Patient with ID ${id} not found or does not belong to user`,
      );
    }
    return patient;
  }

  async update(
    id: number,
    updatePatientDto: UpdatePatientDto,
    user: User,
  ): Promise<Patient> {
    const patient = await this.verifyPatientOwnership(id, user);
    this.patientRepository.merge(patient, updatePatientDto);
    return await this.patientRepository.save(patient);
  }

  async remove(id: number, user: User): Promise<void> {
    const patient = await this.verifyPatientOwnership(id, user);
    await this.patientRepository.remove(patient);
  }

  async verifyPatientOwnership(id: number, user: User): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!patient) {
      throw new ForbiddenException(
        `Patient with ID ${id} does not belong to user`,
      );
    }
    return patient;
  }
}

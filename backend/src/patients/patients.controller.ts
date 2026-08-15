import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Patient } from './entities/patient.entity';

@ApiTags('patients')
@ApiBearerAuth('JWT')
@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new patient', description: 'Creates a new patient for the authenticated user' })
  @ApiBody({
    type: CreatePatientDto,
    examples: {
      default: {
        value: {
          lastName: 'Dupont',
          firstName: 'Jean',
          age: 45,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Patient created successfully', type: Patient })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() user: User,
  ) {
    return this.patientsService.create(createPatientDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all patients', description: 'Returns all patients belonging to the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of patients', type: [Patient] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() user: User) {
    return this.patientsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a patient by ID', description: 'Returns a specific patient belonging to the authenticated user' })
  @ApiParam({ name: 'id', type: Number, description: 'Patient ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Patient found', type: Patient })
  @ApiResponse({ status: 404, description: 'Patient not found or does not belong to user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.patientsService.findOne(+id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a patient', description: 'Updates a specific patient belonging to the authenticated user' })
  @ApiParam({ name: 'id', type: Number, description: 'Patient ID', example: 1 })
  @ApiBody({
    type: UpdatePatientDto,
    examples: {
      default: {
        value: {
          lastName: 'Durand',
          firstName: 'Pierre',
          age: 50,
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Patient updated successfully', type: Patient })
  @ApiResponse({ status: 404, description: 'Patient not found or does not belong to user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - patient does not belong to user' })
  update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentUser() user: User,
  ) {
    return this.patientsService.update(+id, updatePatientDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a patient', description: 'Deletes a specific patient belonging to the authenticated user' })
  @ApiParam({ name: 'id', type: Number, description: 'Patient ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Patient deleted successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found or does not belong to user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - patient does not belong to user' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.patientsService.remove(+id, user);
  }
}

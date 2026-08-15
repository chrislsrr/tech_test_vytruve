import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrintingService } from './printing.service';
import { StartPrintJobDto } from './dto/start-print-job.dto';
import { PrintJob } from './interfaces/print-job.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('printing')
@ApiBearerAuth('JWT')
@Controller('printing')
@UseGuards(JwtAuthGuard)
export class PrintingController {
  constructor(private readonly printingService: PrintingService) {}

  @Get('/health')
  @ApiOperation({ summary: 'Health check for printing API', description: 'Returns the health status of the printing service' })
  @ApiResponse({ status: 200, description: 'Health check successful', type: String })
  @ApiResponse({ status: 503, description: 'Printing service unavailable' })
  async healthCheck() {
    return this.printingService.healthCheck();
  }

  @Post('/start')
  @ApiOperation({ 
    summary: 'Start a new print job', 
    description: 'Starts a new print job using an already uploaded file' 
  })
  @ApiBody({
    description: 'File ID, Patient ID and socket reference',
    type: StartPrintJobDto,
  })
  @ApiResponse({ status: 201, description: 'Print job started successfully', type: PrintJob })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters or socket reference' })
  @ApiResponse({ status: 404, description: 'File or patient not found' })
  @ApiResponse({ status: 429, description: 'Too many jobs in progress (max 5)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async startPrintJob(
    @Body() dto: StartPrintJobDto,
    @CurrentUser() user: User,
  ) {
    return this.printingService.startPrintJob(
      dto.fileId,
      dto.patientId,
      dto.socketReference,
      user,
    );
  }

  @Get()
  @ApiOperation({ 
    summary: 'List all print jobs', 
    description: 'Returns all print jobs in creation order' 
  })
  @ApiResponse({ status: 200, description: 'List of print jobs', type: [PrintJob] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listPrintJobs() {
    return this.printingService.listPrintJobs();
  }

  @Get('/:id')
  @ApiOperation({ 
    summary: 'Get a print job by ID', 
    description: 'Returns a specific print job by its UUID' 
  })
  @ApiParam({ name: 'id', type: String, description: 'Print job ID (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Print job found', type: PrintJob })
  @ApiResponse({ status: 404, description: 'Print job not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPrintJobById(@Param('id') id: string) {
    return this.printingService.getPrintJobById(id);
  }

  @Get('/reference/:reference')
  @ApiOperation({ 
    summary: 'Get a print job by reference', 
    description: 'Returns the job ID for a given socket reference' 
  })
  @ApiParam({ name: 'reference', type: String, description: 'Socket reference', example: 'socket-001' })
  @ApiResponse({ status: 200, description: 'Job ID found', type: String })
  @ApiResponse({ status: 404, description: 'No job found with this reference' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPrintJobByReference(@Param('reference') reference: string) {
    return this.printingService.getPrintJobByReference(reference);
  }
}

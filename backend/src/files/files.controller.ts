import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Delete,
  Res,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiProduces,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import type { MulterFile } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { File as FileEntity } from './entities/file.entity';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';


@ApiTags('files')
@ApiBearerAuth('JWT')
@Controller()
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('/patients/:patientId/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload a file for a patient', 
    description: 'Uploads a .ply file for a specific patient belonging to the authenticated user' 
  })
  @ApiParam({ name: 'patientId', type: Number, description: 'Patient ID', example: 1 })
  @ApiBody({
    description: 'File to upload (only .ply files are allowed)',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: FileEntity })
  @ApiResponse({ status: 400, description: 'Bad request - No file uploaded or invalid file type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Patient does not belong to user' })
  async uploadFile(
    @Param('patientId') patientId: string,
    @UploadedFile() file: MulterFile,
    @CurrentUser() user: User,
  ) {
    return this.filesService.uploadFile(+patientId, file, user);
  }

  @Get('/patients/:patientId/files')
  @ApiOperation({ 
    summary: 'List files for a patient', 
    description: 'Returns all files for a specific patient belonging to the authenticated user' 
  })
  @ApiParam({ name: 'patientId', type: Number, description: 'Patient ID', example: 1 })
  @ApiResponse({ status: 200, description: 'List of files', type: [FileEntity] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Patient does not belong to user' })
  async getFilesByPatient(
    @Param('patientId') patientId: string,
    @CurrentUser() user: User,
  ) {
    return this.filesService.getFilesByPatient(+patientId, user);
  }

  @Get('/patients/:patientId/files/:fileId/download')
  @ApiOperation({ 
    summary: 'Download a file', 
    description: 'Downloads a specific file belonging to the authenticated user' 
  })
  @ApiParam({ name: 'patientId', type: Number, description: 'Patient ID', example: 1 })
  @ApiParam({ name: 'fileId', type: Number, description: 'File ID', example: 1 })
  @ApiProduces('application/octet-stream')
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - File does not belong to user' })
  async downloadFile(
    @Param('patientId') patientId: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const file = await this.filesService.getFile(+patientId, +fileId, user);
    
    const absolutePath = path.join(__dirname, '..', '..', file.filePath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundException(`File not found: ${file.originalName}`);
    }

    const fileStream = fs.createReadStream(absolutePath);
    
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    fileStream.pipe(res);
  }

  @Delete('/patients/:patientId/files/:fileId')
  @ApiOperation({ 
    summary: 'Delete a file', 
    description: 'Deletes a specific file and its record belonging to the authenticated user' 
  })
  @ApiParam({ name: 'patientId', type: Number, description: 'Patient ID', example: 1 })
  @ApiParam({ name: 'fileId', type: Number, description: 'File ID', example: 1 })
  @ApiResponse({ status: 200, description: 'File and record deleted successfully' })
  @ApiResponse({ status: 404, description: 'File or record not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - File does not belong to user' })
  async deleteFile(
    @Param('patientId') patientId: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: User,
  ) {
    await this.filesService.deleteFile(+patientId, +fileId, user);
    return { message: 'File and record deleted successfully' };
  }
}

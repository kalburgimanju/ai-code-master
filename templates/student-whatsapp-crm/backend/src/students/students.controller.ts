import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/student.dto';
import { CsvImportService } from './import/csv-import.service';
import { XlsxImportService } from './import/xlsx-import.service';
import { SheetsImportService } from './import/sheets-import.service';

@Controller('api/students')
export class StudentsController {
  constructor(
    private readonly students: StudentsService,
    private readonly csv: CsvImportService,
    private readonly xlsx: XlsxImportService,
    private readonly sheets: SheetsImportService,
  ) {}

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.students.create(dto);
  }

  @Get()
  findAll(@Query('status') status?: string, @Query('course') course?: string) {
    return this.students.findAll({ status, course });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.students.findOne(id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    const rows = this.csv.parse(file.buffer);
    return this.students.importRows(rows);
  }

  @Post('import/xlsx')
  @UseInterceptors(FileInterceptor('file'))
  async importXlsx(@UploadedFile() file: Express.Multer.File) {
    const rows = await this.xlsx.parse(file.buffer);
    return this.students.importRows(rows);
  }

  @Post('import/sheets')
  async importSheets(@Body() body: { rows: unknown }) {
    const rows = this.sheets.parse(body.rows);
    return this.students.importRows(rows);
  }
}

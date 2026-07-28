import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './student.entity';
import { CsvImportService } from './import/csv-import.service';
import { XlsxImportService } from './import/xlsx-import.service';
import { SheetsImportService } from './import/sheets-import.service';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [TypeOrmModule.forFeature([Student]), ScoringModule],
  controllers: [StudentsController],
  providers: [StudentsService, CsvImportService, XlsxImportService, SheetsImportService],
  exports: [StudentsService],
})
export class StudentsModule {}

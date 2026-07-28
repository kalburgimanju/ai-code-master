import { IsOptional, IsString } from 'class-validator';
import { StudentStatus } from '../../common/student-status';

export class CreateStudentDto {
  @IsString() name: string;
  @IsString() phone: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() course?: string;
  @IsOptional() @IsString() currentProfession?: string;
  @IsOptional() @IsString() leadSource?: string;
  @IsOptional() status?: StudentStatus;
}

export class ImportResultDto {
  imported: number;
  skipped: number;
  errors: string[];
}

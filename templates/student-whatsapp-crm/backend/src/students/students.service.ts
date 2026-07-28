import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';
import { ParsedStudent } from './import/csv-import.service';
import { ScoringService } from '../scoring/scoring.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly scoring: ScoringService,
  ) {}

  async create(dto: Partial<Student>): Promise<Student> {
    const student = this.studentRepo.create(dto);
    return this.studentRepo.save(student);
  }

  async findAll(filters?: { status?: string; course?: string }): Promise<Student[]> {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.course) where.course = filters.course;
    return this.studentRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Student | null> {
    return this.studentRepo.findOne({ where: { id } });
  }

  /** Upsert parsed rows (dedupe by phone). Creates a lead-score row per new student. */
  async importRows(rows: ParsedStudent[]): Promise<{ imported: number; skipped: number; errors: string[] }> {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    for (const row of rows) {
      if (!row.phone) {
        skipped++;
        errors.push(`Missing phone for "${row.name}"`);
        continue;
      }
      const existing = await this.studentRepo.findOne({ where: { phone: row.phone } });
      if (existing) {
        skipped++;
        continue;
      }
      const student = await this.studentRepo.save(this.studentRepo.create(row));
      await this.scoring.recordEvent(student.id, 'manual');
      imported++;
    }
    return { imported, skipped, errors };
  }
}

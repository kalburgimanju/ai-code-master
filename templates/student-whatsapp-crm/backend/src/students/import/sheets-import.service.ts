import { Injectable } from '@nestjs/common';
import { ParsedStudent } from './csv-import.service';

/**
 * Google Sheets import. The real adapter would use the Sheets API + OAuth
 * (gated by credentials). For the demo it reads a local JSON fixture shaped like
 * a sheet, so the import flow is exercised end-to-end without external auth.
 */
@Injectable()
export class SheetsImportService {
  parse(json: unknown): ParsedStudent[] {
    const rows = (json as any[]) ?? [];
    return rows.map((r) => ({
      name: String(r.name ?? '').trim(),
      phone: String(r.phone ?? r.phoneNumber ?? '').trim(),
      email: r.email ? String(r.email).trim() : undefined,
      city: r.city ? String(r.city).trim() : undefined,
      course: r.course ? String(r.course).trim() : undefined,
      leadSource: r.leadSource ? String(r.leadSource).trim() : undefined,
    }));
  }
}

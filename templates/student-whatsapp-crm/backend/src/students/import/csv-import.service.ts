import { Injectable } from '@nestjs/common';
import * as Papa from 'papaparse';

export interface ParsedStudent {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  course?: string;
  leadSource?: string;
}

/**
 * Parses a CSV buffer into normalized student rows. Expected headers:
 * Name, Phone, Email, City, Course, Lead Source (case-insensitive).
 */
@Injectable()
export class CsvImportService {
  parse(buffer: Buffer): ParsedStudent[] {
    const text = buffer.toString('utf-8');
    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });
    return (result.data ?? []).map((row) => this.normalize(row));
  }

  private normalize(row: Record<string, string>): ParsedStudent {
    const get = (key: string) =>
      Object.keys(row).find((k) => k.toLowerCase().trim() === key) != undefined
        ? row[Object.keys(row).find((k) => k.toLowerCase().trim() === key)!]
        : '';
    return {
      name: (get('name') || '').trim(),
      phone: (get('phone') || get('phonenumber') || '').trim(),
      email: (get('email') || '').trim() || undefined,
      city: (get('city') || '').trim() || undefined,
      course: (get('course') || get('courseinterestedin') || '').trim() || undefined,
      leadSource: (get('leadsource') || get('source') || '').trim() || undefined,
    };
  }
}

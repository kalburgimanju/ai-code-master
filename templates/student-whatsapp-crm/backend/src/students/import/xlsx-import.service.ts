import { Injectable } from '@nestjs/common';
import * as exceljs from 'exceljs';
import { ParsedStudent } from './csv-import.service';

/**
 * Parses an .xlsx buffer into normalized student rows. First row is the header.
 */
@Injectable()
export class XlsxImportService {
  async parse(buffer: Buffer): Promise<ParsedStudent[]> {
    const wb = new exceljs.Workbook();
    await wb.xlsx.load(buffer as any);
    const ws = wb.worksheets[0];
    if (!ws) return [];

    const headerRow = ws.getRow(1).values as unknown[];
    const headers: string[] = (headerRow.slice(1) as any[]).map((h) =>
      String(h ?? '').toLowerCase().trim(),
    );

    const out: ParsedStudent[] = [];
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const values = (row.values as unknown[]).slice(1) as any[];
      const pick = (...names: string[]) => {
        const idx = headers.findIndex((h) => names.includes(h));
        return idx >= 0 ? String(values[idx] ?? '').trim() : '';
      };
      const name = pick('name');
      const phone = pick('phone', 'phonenumber');
      if (!name && !phone) return;
      out.push({
        name,
        phone,
        email: pick('email') || undefined,
        city: pick('city') || undefined,
        course: pick('course', 'courseinterestedin') || undefined,
        leadSource: pick('leadsource', 'source') || undefined,
      });
    });
    return out;
  }
}

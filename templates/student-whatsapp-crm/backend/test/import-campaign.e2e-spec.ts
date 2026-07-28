import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

// Provider + DB env is configured in test/setup-e2e.ts (runs before imports).
describe('Students + Campaigns (e2e)', () => {
  let app: INestApplication;
  let ds: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    ds = app.get(DataSource);
  }, 30000);

  afterAll(async () => {
    await app.close();
    // Clean up the isolated e2e database file(s) created by setup-e2e.ts.
    try {
      const dir = join(process.cwd(), 'data');
      for (const f of readdirSync(dir)) {
        if (f.startsWith('e2e-') && f.endsWith('.db')) unlinkSync(join(dir, f));
      }
    } catch {
      /* ignore */
    }
  });

  it('imports a student via CSV and sends a campaign through the mock provider', async () => {
    const csv = 'Name,Phone,Course\nRahul,+919999999999,AI Engineering\n';
    const res = await request(app.getHttpServer())
      .post('/api/students/import')
      .attach('file', Buffer.from(csv), 'students.csv');

    expect(res.status).toBe(201);
    expect(res.body.imported).toBe(1);

    // create a campaign
    const campaign = await request(app.getHttpServer())
      .post('/api/campaigns')
      .send({ name: 'Test', message: 'Hi {name}, join {course}!' })
      .expect(201);

    // send broadcast
    const send = await request(app.getHttpServer())
      .post(`/api/campaigns/${campaign.body.id}/send`)
      .expect(201);
    expect(send.body.queued).toBeGreaterThanOrEqual(1);

    // allow the in-memory queue to flush sends
    await new Promise((r) => setTimeout(r, 500));

    const messages = await request(app.getHttpServer())
      .get(`/api/campaigns/${campaign.body.id}/messages`)
      .expect(200);
    expect(messages.body.length).toBeGreaterThanOrEqual(1);
    expect(['delivered', 'sent']).toContain(messages.body[0].status);

    // analytics reflects the sent message
    const analytics = await request(app.getHttpServer())
      .get('/api/analytics/overview')
      .expect(200);
    expect(analytics.body.messagesSent).toBeGreaterThanOrEqual(1);
  });
});

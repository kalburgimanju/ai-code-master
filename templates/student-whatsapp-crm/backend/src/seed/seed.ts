import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { buildDatabaseOptions } from '../common/db/database.provider';
import { Student } from '../students/student.entity';
import { TeamMember } from '../team/team-member.entity';
import { LeadScore } from '../scoring/lead-score.entity';
import { Campaign } from '../campaigns/campaign.entity';
import { Workflow } from '../workflows/workflow.entity';
import { Payment } from '../payments/payment.entity';

async function seed() {
  const options = buildDatabaseOptions();
  const ds = new DataSource({
    ...options,
    entities: [Student, TeamMember, LeadScore, Campaign, Workflow, Payment],
  } as any);
  // Ensure the sqlite driver matches the app (better-sqlite3)
  (ds as any).options.type = 'better-sqlite3';
  await ds.initialize();

  const students = ds.getRepository(Student);
  const team = ds.getRepository(TeamMember);
  const scores = ds.getRepository(LeadScore);
  const campaigns = ds.getRepository(Campaign);
  const workflows = ds.getRepository(Workflow);
  const payments = ds.getRepository(Payment);

  // --- Team (counselors by city) ---
  const counselorA = await team.save(team.create({ name: 'Anita', email: 'anita@edu.co', city: 'Bangalore', role: 'counselor' }));
  const counselorB = await team.save(team.create({ name: 'Raj', email: 'raj@edu.co', city: 'Hyderabad', role: 'counselor' }));
  const counselorC = await team.save(team.create({ name: 'Sam', email: 'sam@edu.co', city: 'USA', role: 'counselor' }));

  // --- Students (example data from the plan) ---
  const rahul = await students.save(
    students.create({
      name: 'Rahul',
      phone: '+919999999999',
      email: 'rahul@example.com',
      city: 'Bangalore',
      course: 'AI Engineering',
      status: 'Interested',
      leadSource: 'Website',
    }),
  );
  const priya = await students.save(
    students.create({
      name: 'Priya',
      phone: '+919888888888',
      email: 'priya@example.com',
      city: 'Hyderabad',
      course: 'React',
      status: 'New Lead',
      leadSource: 'Referral',
    }),
  );

  // --- Lead scores + auto-assignment by city ---
  await scores.save(scores.create({ studentId: rahul.id, score: 25, lastEvent: 'replied', assignedTo: counselorA.id }));
  await scores.save(scores.create({ studentId: priya.id, score: 5, lastEvent: 'opened', assignedTo: counselorB.id }));

  // --- Campaign ---
  await campaigns.save(
    campaigns.create({
      name: 'AI Engineering July Batch',
      message:
        'Hi {name}, our {course} course starts on July 20. Reply YES to join!',
      status: 'active',
    }),
  );

  // --- Example workflow (trigger -> send -> wait -> condition -> branch) ---
  const exampleWorkflow = {
    trigger: { type: 'student_imported' },
    steps: [
      { id: 's1', type: 'send', message: 'Welcome {name}! Glad to have you interested in {course}.' },
      { id: 's2', type: 'wait', durationMs: 86400000 },
      { id: 's3', type: 'condition', field: 'leadScore', op: '>=', value: 20, then: 's4', else: 's5' },
      { id: 's4', type: 'assign', to: 'counselor_by_city' },
      { id: 's5', type: 'send', message: 'Hi {name}, here is a special offer on {course}!' },
      { id: 's6', type: 'end' },
    ],
  };
  await workflows.save(
    workflows.create({ name: 'New Student Onboarding', jsonConfig: JSON.stringify(exampleWorkflow), status: 'active' }),
  );

  // --- A payment record for analytics ---
  await payments.save(
    payments.create({ studentId: rahul.id, amount: 25000, currency: 'INR', provider: 'mock', status: 'created', description: 'AI Engineering' }),
  );

  console.log('✅ Seed complete:');
  console.log(`   Students: ${await students.count()}`);
  console.log(`   Counselors: ${await team.count()}`);
  console.log(`   Campaigns: ${await campaigns.count()}`);
  console.log(`   Workflows: ${await workflows.count()}`);
  console.log(`   Payments: ${await payments.count()}`);

  await ds.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

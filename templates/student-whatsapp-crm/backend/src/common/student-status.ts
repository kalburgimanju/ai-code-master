export const STUDENT_STATUSES = [
  'New Lead',
  'Interested',
  'Demo Scheduled',
  'Paid',
  'Enrolled',
  'Lost',
] as const;

export type StudentStatus = (typeof STUDENT_STATUSES)[number];

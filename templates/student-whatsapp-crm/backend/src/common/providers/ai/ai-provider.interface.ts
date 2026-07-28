export interface AIContext {
  studentName?: string;
  course?: string;
  city?: string;
}

export interface AIProvider {
  readonly name: string;
  answerFAQ(question: string, ctx?: AIContext): Promise<string>;
}

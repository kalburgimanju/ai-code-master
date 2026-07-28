export interface MessageContext {
  name?: string;
  course?: string;
  city?: string;
}

/**
 * Replaces {name}, {course}, {city} tokens in a message template.
 */
export function renderTemplate(template: string, ctx: MessageContext): string {
  return template
    .replace(/\{name\}/gi, ctx.name ?? '')
    .replace(/\{course\}/gi, ctx.course ?? '')
    .replace(/\{city\}/gi, ctx.city ?? '');
}

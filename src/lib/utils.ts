import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// POPIA scrubber for owner names & attributes
export function scrubPopiaData(text?: string | null): string | null {
  if (!text) return null;
  let scrubbed = text;
  // Remove 13-digit SA ID patterns
  scrubbed = scrubbed.replace(/\b\d{13}\b/g, '[REDACTED ID]');
  // Remove emails
  scrubbed = scrubbed.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, '[REDACTED EMAIL]');
  // Remove phone numbers e.g. 0821234567, +27821234567
  scrubbed = scrubbed.replace(/(?:\+27|0)\d{9}/g, '[REDACTED PHONE]');
  return scrubbed;
}

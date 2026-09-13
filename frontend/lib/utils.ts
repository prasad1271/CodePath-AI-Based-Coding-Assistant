import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score?: number): string {
  if (score === undefined || score === null) return "0.0%";
  return `${score.toFixed(1)}%`;
}

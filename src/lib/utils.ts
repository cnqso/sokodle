import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMilliseconds(ms: number): string {
  if (ms < 0) throw new Error("Milliseconds cannot be negative");
  
  const totalSeconds = Math.floor(ms / 100);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  console.log(ms)
  console.log(seconds)
  
  if (minutes > 0) {
      return `${minutes}m${seconds.toString().padStart(2, '0')}`;
  } else {
      return `${seconds}`;
  }
}
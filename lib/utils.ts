// atlas-workout-system/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { parseISO } from 'date-fns' // Importar parseISO aqui

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures the date string includes a UTC indicator ('Z') if the offset is missing,
 * then parses it into a Date object using parseISO.
 * Returns null if the input is null, undefined, or an empty string.
 */
export function ensureUtcAndParse(dateString: string | null | undefined): Date | null {
  if (!dateString) {
    return null; // Retorna null se a string for nula, indefinida ou vazia
  }

  // Regex to check if it ends with Z or +HH:MM or -HH:MM
  if (/Z|([+-]\d{2}:\d{2})$/.test(dateString)) {
    try {
      return parseISO(dateString); // Já tem offset, apenas parse
    } catch (e) {
      console.error("Error parsing date string with offset:", dateString, e);
      return null; // Retorna null em caso de erro no parse
    }
  }

  // Se o offset está faltando, adicione 'Z' para especificar UTC
  try {
    return parseISO(dateString + 'Z');
  } catch (e) {
    console.error("Error parsing date string after adding Z:", dateString + 'Z', e);
    return null; // Retorna null em caso de erro no parse
  }
}
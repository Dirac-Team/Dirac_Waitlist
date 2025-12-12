/**
 * Generate a random license key in format: DIRAC-XXXX-YYYY
 */
export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  const randomSegment = (length: number): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  return `DIRAC-${randomSegment(4)}-${randomSegment(4)}`;
}

/**
 * Validate license key format
 */
export function isValidLicenseKeyFormat(key: string): boolean {
  return /^DIRAC-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key);
}


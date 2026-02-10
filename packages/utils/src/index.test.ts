import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  calculateDistance,
  slugify,
} from './index';

describe('formatCurrency', () => {
  it('should format USD currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should format EUR currency correctly', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
  });

  it('should handle zero value', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should handle negative values', () => {
    expect(formatCurrency(-50.25)).toBe('-$50.25');
  });
});

describe('formatDate', () => {
  it('should format Date object correctly', () => {
    const date = new Date('2024-01-15');
    const formatted = formatDate(date);
    expect(formatted).toBe('January 15, 2024');
  });

  it('should format date string correctly', () => {
    const formatted = formatDate('2024-12-25');
    expect(formatted).toBe('December 25, 2024');
  });

  it('should handle ISO date strings', () => {
    const formatted = formatDate('2024-06-01T12:00:00Z');
    expect(formatted).toBe('June 1, 2024');
  });
});

describe('calculateDistance', () => {
  it('should calculate distance between two coordinates', () => {
    // Distance between New York (40.7128, -74.0060) and Los Angeles (34.0522, -118.2437)
    const distance = calculateDistance(40.7128, -74.006, 34.0522, -118.2437);
    // Expected distance is approximately 3935 km
    expect(distance).toBeGreaterThan(3900);
    expect(distance).toBeLessThan(4000);
  });

  it('should return 0 for same coordinates', () => {
    const distance = calculateDistance(40.7128, -74.006, 40.7128, -74.006);
    expect(distance).toBeCloseTo(0, 2);
  });

  it('should calculate short distances accurately', () => {
    // Distance between two points 1km apart
    const distance = calculateDistance(0, 0, 0.009, 0);
    expect(distance).toBeCloseTo(1, 0);
  });

  it('should handle negative coordinates', () => {
    const distance = calculateDistance(-33.8688, 151.2093, 51.5074, -0.1278);
    // Sydney to London - approximately 17000 km
    expect(distance).toBeGreaterThan(16000);
    expect(distance).toBeLessThan(18000);
  });
});

describe('slugify', () => {
  it('should convert text to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('This is a test')).toBe('this-is-a-test');
  });

  it('should remove special characters', () => {
    expect(slugify('Hello @#$ World!')).toBe('hello-world');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('Hello    World')).toBe('hello-world');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world');
  });

  it('should handle consecutive hyphens', () => {
    expect(slugify('Hello---World')).toBe('hello-world');
  });

  it('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('should handle accented characters', () => {
    expect(slugify('Café au lait')).toBe('caf-au-lait');
  });

  it('should preserve numbers', () => {
    expect(slugify('Product 123')).toBe('product-123');
  });
});

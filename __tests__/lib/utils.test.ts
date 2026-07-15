import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utils', () => {
  describe('cn()', () => {
    it('should merge tailwind classes properly', () => {
      const result = cn('px-2 py-1', 'bg-red-500');
      expect(result).toBe('px-2 py-1 bg-red-500');
    });

    it('should resolve tailwind conflicts using tailwind-merge', () => {
      // bg-blue-500 should overwrite bg-red-500
      const result = cn('bg-red-500', 'bg-blue-500');
      expect(result).toBe('bg-blue-500');
    });

    it('should ignore falsy values', () => {
      const result = cn('px-2', false, null, undefined, 0, 'py-1', {
        'bg-red-500': true,
        'text-white': false,
      });
      expect(result).toBe('px-2 py-1 bg-red-500');
    });
  });
});

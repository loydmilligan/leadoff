/**
 * Unit tests for LostReasonService
 */

import { describe, it, expect } from 'vitest';
import { LostReasonCategory } from '@leadoff/types';
import { LostReasonService } from '../../src/services/lostReasonService.js';

describe('LostReasonService', () => {
  describe('create', () => {
    it('should validate required fields', async () => {
      const invalidData = {
        leadId: '',
        reason: LostReasonCategory.PRICE,
        lostDate: new Date(),
      };

      await expect(LostReasonService.create(invalidData as any)).rejects.toThrow();
    });

    it('should require competitor name when reason is COMPETITOR', async () => {
      const data = {
        leadId: 'test-lead-id',
        reason: LostReasonCategory.COMPETITOR,
        lostDate: new Date(),
      };

      await expect(LostReasonService.create(data)).rejects.toThrow(
        'Competitor name is required when lost reason is COMPETITOR'
      );
    });

    it('should validate lost reason category enum', async () => {
      const invalidData = {
        leadId: 'test-lead-id',
        reason: 'INVALID_REASON' as any,
        lostDate: new Date(),
      };

      await expect(LostReasonService.create(invalidData)).rejects.toThrow();
    });

    it('should validate notes max length', async () => {
      const data = {
        leadId: 'test-lead-id',
        reason: LostReasonCategory.PRICE,
        lostDate: new Date(),
        notes: 'a'.repeat(5001),
      };

      await expect(LostReasonService.create(data)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should require valid lead ID', async () => {
      await expect(LostReasonService.update('', {})).rejects.toThrow('Valid lead ID is required');
    });

    it('should require competitor name when updating reason to COMPETITOR', async () => {
      const data = {
        reason: LostReasonCategory.COMPETITOR,
      };

      await expect(LostReasonService.update('test-lead-id', data)).rejects.toThrow(
        'Competitor name is required when lost reason is COMPETITOR'
      );
    });
  });

  describe('getByLeadId', () => {
    it('should require valid lead ID', async () => {
      await expect(LostReasonService.getByLeadId('')).rejects.toThrow(
        'Valid lead ID is required'
      );
    });
  });

  describe('delete', () => {
    it('should require valid lead ID', async () => {
      await expect(LostReasonService.delete('')).rejects.toThrow('Valid lead ID is required');
    });
  });
});

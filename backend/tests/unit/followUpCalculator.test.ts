import { describe, it, expect } from 'vitest';
import {
  calculateNextFollowUp,
  getDaysFromNow,
  getFollowUpStatus,
} from '../../src/utils/followUpCalculator';
import { addDays, addHours, subDays, startOfDay } from 'date-fns';
import { Stage } from '@leadoff/types';

describe('followUpCalculator', () => {
  const baseDate = new Date('2025-01-15T10:00:00Z');

  describe('calculateNextFollowUp', () => {
    it('should calculate +24 hours for INQUIRY stage', () => {
      const result = calculateNextFollowUp({ stage: Stage.INQUIRY, baseDate });
      const expected = addHours(baseDate, 24);
      expect(result).toEqual(expected);
    });

    it('should calculate +48 hours for QUALIFICATION stage', () => {
      const result = calculateNextFollowUp({ stage: Stage.QUALIFICATION, baseDate });
      const expected = addHours(baseDate, 48);
      expect(result).toEqual(expected);
    });

    it('should calculate +3 days for OPPORTUNITY stage', () => {
      const result = calculateNextFollowUp({ stage: Stage.OPPORTUNITY, baseDate });
      const expected = addDays(baseDate, 3);
      expect(result).toEqual(expected);
    });

    it('should calculate 1 day before demo date for DEMO_SCHEDULED with demoDate', () => {
      const demoDate = addDays(baseDate, 5);
      const result = calculateNextFollowUp({ stage: Stage.DEMO_SCHEDULED, baseDate, demoDate });
      const expected = addDays(startOfDay(demoDate), -1);
      expect(result).toEqual(expected);
    });

    it('should calculate +1 day for DEMO_SCHEDULED without demoDate', () => {
      const result = calculateNextFollowUp({ stage: Stage.DEMO_SCHEDULED, baseDate });
      const expected = addDays(baseDate, 1);
      expect(result).toEqual(expected);
    });

    it('should calculate +1 day for DEMO_COMPLETE stage', () => {
      const result = calculateNextFollowUp({ stage: Stage.DEMO_COMPLETE, baseDate });
      const expected = addDays(baseDate, 1);
      expect(result).toEqual(expected);
    });

    it('should calculate +3 days for PROPOSAL_SENT stage', () => {
      const result = calculateNextFollowUp({ stage: Stage.PROPOSAL_SENT, baseDate });
      const expected = addDays(baseDate, 3);
      expect(result).toEqual(expected);
    });

    it('should calculate +2 days for NEGOTIATION stage', () => {
      const result = calculateNextFollowUp({ stage: Stage.NEGOTIATION, baseDate });
      const expected = addDays(baseDate, 2);
      expect(result).toEqual(expected);
    });

    it('should return null for CLOSED_WON stage', () => {
      const result = calculateNextFollowUp({ stage: Stage.CLOSED_WON, baseDate });
      expect(result).toBeNull();
    });

    it('should return null for CLOSED_LOST stage', () => {
      const result = calculateNextFollowUp({ stage: Stage.CLOSED_LOST, baseDate });
      expect(result).toBeNull();
    });

    it('should use current date if baseDate not provided', () => {
      const before = new Date();
      const result = calculateNextFollowUp({ stage: Stage.INQUIRY });
      const after = new Date();

      expect(result).toBeDefined();
      expect(result!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result!.getTime()).toBeLessThanOrEqual(after.getTime() + 24 * 60 * 60 * 1000 + 1000);
    });
  });

  describe('getDaysFromNow', () => {
    const now = new Date('2025-01-15T10:00:00Z');

    it('should return positive number for past dates', () => {
      const pastDate = subDays(now, 3);
      const result = getDaysFromNow(pastDate, now);
      expect(result).toBe(3);
    });

    it('should return 0 for same day', () => {
      const sameDay = new Date(now);
      const result = getDaysFromNow(sameDay, now);
      expect(result).toBe(0);
    });

    it('should return negative number for future dates', () => {
      const futureDate = addDays(now, 5);
      const result = getDaysFromNow(futureDate, now);
      expect(result).toBe(-5);
    });
  });

  describe('getFollowUpStatus', () => {
    const now = new Date('2025-01-15T14:00:00Z');

    it('should return "none" for null date', () => {
      const result = getFollowUpStatus(null, now);
      expect(result).toBe('none');
    });

    it('should return "none" for undefined date', () => {
      const result = getFollowUpStatus(undefined, now);
      expect(result).toBe('none');
    });

    it('should return "overdue" for past dates', () => {
      const pastDate = subDays(now, 2);
      const result = getFollowUpStatus(pastDate, now);
      expect(result).toBe('overdue');
    });

    it('should return "today" for same day', () => {
      const todayDate = new Date('2025-01-15T08:00:00Z'); // Earlier same day
      const result = getFollowUpStatus(todayDate, now);
      expect(result).toBe('today');
    });

    it('should return "upcoming" for future dates', () => {
      const futureDate = addDays(now, 3);
      const result = getFollowUpStatus(futureDate, now);
      expect(result).toBe('upcoming');
    });
  });
});

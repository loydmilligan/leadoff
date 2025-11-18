/**
 * Shared TypeScript types for LeadOff CRM
 * These types are used across frontend and backend
 */

export enum Stage {
  INQUIRY = 'INQUIRY',
  QUALIFICATION = 'QUALIFICATION',
  OPPORTUNITY = 'OPPORTUNITY',
  DEMO_SCHEDULED = 'DEMO_SCHEDULED',
  DEMO_COMPLETE = 'DEMO_COMPLETE',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
  NURTURE_30_DAY = 'NURTURE_30_DAY',
  NURTURE_90_DAY = 'NURTURE_90_DAY',
}

export enum LeadSource {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  WEBSITE = 'WEBSITE',
  REFERRAL = 'REFERRAL',
  TRADE_SHOW = 'TRADE_SHOW',
  OTHER = 'OTHER',
}

export enum DemoType {
  ONLINE = 'ONLINE',
  IN_PERSON = 'IN_PERSON',
  HYBRID = 'HYBRID',
}

export enum DemoOutcome {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE',
  NO_SHOW = 'NO_SHOW',
}

export enum ActivityType {
  EMAIL = 'EMAIL',
  PHONE_CALL = 'PHONE_CALL',
  MEETING = 'MEETING',
  NOTE = 'NOTE',
  TASK = 'TASK',
}

export enum ProposalStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum LostReasonCategory {
  PRICE = 'PRICE',
  COMPETITOR = 'COMPETITOR',
  NO_RESPONSE = 'NO_RESPONSE',
  NOT_QUALIFIED = 'NOT_QUALIFIED',
  TIMING = 'TIMING',
  OTHER = 'OTHER',
}

/**
 * Stage Validation Utility
 * Validates stage transitions and required fields per stage
 */

import { PrismaClient } from '@prisma/client'
import { Stage } from '@leadoff/types'

const prisma = new PrismaClient()

export interface ValidationError {
  field: string
  reason: string
  code: string
}

export interface StageValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  canForce: boolean
}

export class StageValidator {
  /**
   * Validate stage transition
   * Returns validation errors and warnings
   */
  static async validateStageTransition(
    leadId: string,
    targetStage: Stage,
    force = false
  ): Promise<StageValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    // Get lead with all related data
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        organizationInfo: true,
        demoDetails: true,
        proposal: true,
        lostReason: true,
      },
    })

    if (!lead) {
      errors.push({
        field: 'leadId',
        reason: 'Lead not found',
        code: 'NOT_FOUND',
      })
      return { valid: false, errors, warnings, canForce: false }
    }

    // Stage-specific validation
    switch (targetStage) {
      case Stage.INQUIRY:
        // Minimum requirements for inquiry
        if (!lead.companyName || lead.companyName.length < 2) {
          errors.push({
            field: 'companyName',
            reason: 'Company name required (2-200 chars)',
            code: 'REQUIRED_FIELD',
          })
        }
        if (!lead.contactName || lead.contactName.length < 2) {
          errors.push({
            field: 'contactName',
            reason: 'Contact name required (2-100 chars)',
            code: 'REQUIRED_FIELD',
          })
        }
        if (!lead.phone && !lead.email) {
          errors.push({
            field: 'phone|email',
            reason: 'At least one contact method (phone or email) required',
            code: 'REQUIRED_FIELD',
          })
        }
        break

      case Stage.QUALIFICATION:
        // Inherits INQUIRY requirements
        if (!lead.email && !force) {
          warnings.push({
            field: 'email',
            reason: 'Email recommended for qualified leads',
            code: 'RECOMMENDED_FIELD',
          })
        }
        break

      case Stage.OPPORTUNITY:
        // Organization info required
        if (!lead.organizationInfo) {
          if (!force) {
            warnings.push({
              field: 'OrganizationInfo',
              reason: 'Organization details recommended for opportunities',
              code: 'RECOMMENDED_FIELD',
            })
          }
        } else {
          if (!lead.organizationInfo.employeeCount && !force) {
            warnings.push({
              field: 'OrganizationInfo.employeeCount',
              reason: 'Employee count helps qualify opportunity',
              code: 'RECOMMENDED_FIELD',
            })
          }
          if (!lead.organizationInfo.industry && !force) {
            warnings.push({
              field: 'OrganizationInfo.industry',
              reason: 'Industry information recommended',
              code: 'RECOMMENDED_FIELD',
            })
          }
        }
        break

      case Stage.DEMO_SCHEDULED:
        // Demo details with date required
        if (!lead.demoDetails) {
          errors.push({
            field: 'DemoDetails',
            reason: 'Demo details required for scheduled demo',
            code: 'REQUIRED_FIELD',
          })
        } else if (!lead.demoDetails.demoDate) {
          errors.push({
            field: 'DemoDetails.demoDate',
            reason: 'Demo date must be set',
            code: 'REQUIRED_FIELD',
          })
        }
        break

      case Stage.DEMO_COMPLETE:
        // Demo must be in past with outcome
        if (!lead.demoDetails) {
          errors.push({
            field: 'DemoDetails',
            reason: 'Demo details required',
            code: 'REQUIRED_FIELD',
          })
        } else {
          if (!lead.demoDetails.demoDate) {
            errors.push({
              field: 'DemoDetails.demoDate',
              reason: 'Demo date required',
              code: 'REQUIRED_FIELD',
            })
          } else if (new Date(lead.demoDetails.demoDate) > new Date()) {
            errors.push({
              field: 'DemoDetails.demoDate',
              reason: 'Demo date must be in the past for completed demos',
              code: 'INVALID_DATE',
            })
          }
          if (!lead.demoDetails.demoOutcome && !force) {
            warnings.push({
              field: 'DemoDetails.demoOutcome',
              reason: 'Demo outcome recommended',
              code: 'RECOMMENDED_FIELD',
            })
          }
        }
        break

      case Stage.PROPOSAL_SENT:
        // Proposal with value required
        if (!lead.proposal) {
          errors.push({
            field: 'Proposal',
            reason: 'Proposal required before sending',
            code: 'REQUIRED_FIELD',
          })
        } else {
          if (!lead.proposal.proposalDate) {
            errors.push({
              field: 'Proposal.proposalDate',
              reason: 'Proposal date required',
              code: 'REQUIRED_FIELD',
            })
          }
          if (!lead.proposal.estimatedValue) {
            errors.push({
              field: 'Proposal.estimatedValue',
              reason: 'Estimated value must be set for proposal',
              code: 'REQUIRED_FIELD',
            })
          }
        }
        break

      case Stage.NEGOTIATION:
        // Inherits PROPOSAL_SENT requirements
        if (!lead.proposal || !lead.proposal.estimatedValue) {
          errors.push({
            field: 'Proposal.estimatedValue',
            reason: 'Proposal value required for negotiation',
            code: 'REQUIRED_FIELD',
          })
        }
        break

      case Stage.CLOSED_WON:
        // Final value required
        if (!lead.proposal || !lead.proposal.estimatedValue) {
          errors.push({
            field: 'Proposal.estimatedValue',
            reason: 'Final deal value required',
            code: 'REQUIRED_FIELD',
          })
        }
        break

      case Stage.CLOSED_LOST:
        // Lost reason required
        if (!lead.lostReason) {
          errors.push({
            field: 'LostReason',
            reason: 'Lost reason required when marking as closed-lost',
            code: 'REQUIRED_FIELD',
          })
        } else {
          if (!lead.lostReason.reason) {
            errors.push({
              field: 'LostReason.reason',
              reason: 'Lost reason must be documented',
              code: 'REQUIRED_FIELD',
            })
          }
        }
        break
    }

    const valid = errors.length === 0 && (warnings.length === 0 || force)
    const canForce = errors.length === 0 && warnings.length > 0

    return { valid, errors, warnings, canForce }
  }
}

export default StageValidator

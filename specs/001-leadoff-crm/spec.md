# Feature Specification: LeadOff CRM

**Feature Branch**: `001-leadoff-crm`
**Created**: 2025-11-13
**Status**: Draft
**Input**: User description: "LeadOff is a CRM web application designed to solve a critical business problem: leads are falling through the cracks and callbacks are taking too long because there's no centralized system to track them. The core goal is simple - one place to easily see each lead, where they are in the process, and what I should be working on for sales right now. The system needs to support the complete sales lifecycle: leads arrive via email as basic Inquiries (company name, contact person, title, phone, email, sometimes business context), get qualified through a brief call (<10 min) where I explain our offerings and gauge interest, convert to Opportunities with detailed organization data and needs assessment, progress through a Teams demo where I gather user count/required modules/cardlock volume, receive a proposal/quote, then move through follow-ups/objections/negotiation to contract signing and accounting handoff. Currently this process is tracked manually using spreadsheets or paper weekly, and data must be entered into our separate legacy system EDIprod (which will remain independent with no integration). A key UX requirement is a thin-screen layout that can run side-by-side with EDIprod since it cannot be resized below half-screen - this would allow easy data entry into both systems simultaneously. Phase 1 should include: email parsing helper/quick-entry form, automated follow-up reminders, pipeline visualization (kanban-style), and quick-search contacts. Essential reporting includes: pipeline value by stage, lead age (time in current stage), weekly activity summary, and win/loss analysis. Future automation candidates include email monitoring, auto-populating company data from external sources, proposal template generation, and automated follow-up sequences."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Lead Entry and Tracking (Priority: P1)

As a sales professional, I receive lead information via email and need to quickly capture it in one centralized location so I can track where each lead is in the sales process and ensure no lead falls through the cracks.

**Why this priority**: This is the core value proposition - solving the immediate pain of lost leads and delayed callbacks. Without this, the system provides no value.

**Independent Test**: Can be fully tested by manually entering a new lead from an email, viewing it in the lead list, and updating its stage. Delivers immediate value by providing a single source of truth for all leads.

**Acceptance Scenarios**:

1. **Given** I receive an email with lead information, **When** I open the quick-entry form and enter company name, contact person, phone, and email, **Then** a new lead is created in "Inquiry" stage and appears in my lead list
2. **Given** I have multiple leads in the system, **When** I view my lead dashboard, **Then** I see all leads with their current stage, contact info, and last activity date
3. **Given** I'm looking at my lead list, **When** I search for a company name or contact person, **Then** the list filters to show only matching leads within 1 second
4. **Given** I complete a qualification call, **When** I update the lead stage to "Opportunity", **Then** the lead moves to the Opportunity stage and prompts me for required organization details
5. **Given** I'm entering data into EDIprod, **When** I have LeadOff open in a narrow window layout (400-600px width), **Then** all lead information remains readable and forms remain fully functional

---

### User Story 2 - Automated Follow-up Management (Priority: P2)

As a sales professional, I need the system to remind me when leads require follow-up so I don't let callbacks take too long and can maintain momentum in the sales process.

**Why this priority**: Solves the second core pain point (callbacks taking too long) and prevents leads from stagnating. Can be built independently of other features.

**Independent Test**: Can be tested by creating leads, setting follow-up dates, and verifying reminders appear at the right time. Delivers immediate value by preventing missed follow-ups.

**Acceptance Scenarios**:

1. **Given** I create a new Inquiry, **When** the system automatically suggests a follow-up date based on stage (24 hours for Inquiry), **Then** a follow-up reminder is scheduled
2. **Given** I have leads with upcoming follow-up dates, **When** I view my dashboard, **Then** I see a prioritized list of leads requiring action today or overdue
3. **Given** a lead has an overdue follow-up, **When** I view my lead list, **Then** the lead is highlighted with visual indicators showing days overdue
4. **Given** I complete a follow-up action, **When** I log the activity and set the next follow-up date, **Then** the reminder is updated and the activity is recorded in the lead history
5. **Given** I have 20+ leads across different stages, **When** I check my "Focus View", **Then** I see only the top 5-10 leads requiring immediate attention, ranked by priority (overdue, high-value, close to decision)

---

### User Story 3 - Pipeline Visualization and Stage Management (Priority: P3)

As a sales professional, I need to see my entire sales pipeline at a glance and easily move leads between stages so I can understand my overall sales health and manage the progression of opportunities.

**Why this priority**: Provides strategic visibility and improves workflow efficiency, but the system is still useful without it (via list views). Can be built after basic tracking is working.

**Independent Test**: Can be tested by creating leads in different stages and dragging them between columns in a kanban view. Delivers value by providing visual pipeline management.

**Acceptance Scenarios**:

1. **Given** I have leads across multiple stages, **When** I view the pipeline kanban board, **Then** I see columns for each stage (Inquiry, Qualification, Opportunity, Demo Scheduled, Proposal Sent, Negotiation, Won, Lost) with lead cards in each
2. **Given** I'm viewing a lead card on the kanban board, **When** I drag it to a different stage column, **Then** the lead's stage updates and any stage-specific prompts appear (e.g., "Enter demo date" when moving to Demo Scheduled)
3. **Given** I move a lead to "Won" stage, **When** the update completes, **Then** the lead is marked as closed-won and removed from active pipeline view (but remains in reports)
4. **Given** I move a lead to "Lost" stage, **When** I complete the update, **Then** I'm prompted to enter a lost reason and the lead is marked as closed-lost
5. **Given** I'm using the pipeline view on a narrow screen, **When** the width is 400-600px, **Then** the kanban view either switches to a vertical list view or allows horizontal scrolling while maintaining card readability

---

### User Story 4 - Demo and Opportunity Tracking (Priority: P4)

As a sales professional, after qualifying a lead and scheduling a demo, I need to capture detailed opportunity information (user count, modules needed, cardlock volume) so I can create accurate proposals and track deal value.

**Why this priority**: Essential for moving qualified leads to close, but depends on basic lead tracking (P1) being in place. Provides the detail needed for proposal generation.

**Independent Test**: Can be tested by creating an Opportunity, scheduling a demo, and capturing all required demo details. Delivers value by organizing pre-proposal information.

**Acceptance Scenarios**:

1. **Given** I convert an Inquiry to an Opportunity, **When** I'm prompted for organization details, **Then** I can enter company industry, size, decision timeline, and key stakeholders
2. **Given** I schedule a demo for an Opportunity, **When** I set the demo date and time, **Then** the system creates a reminder 1 day before and updates the lead stage to "Demo Scheduled"
3. **Given** I complete a demo meeting, **When** I enter demo notes including user count, required modules list, and cardlock volume, **Then** all information is saved and the lead moves to "Demo Complete" sub-stage
4. **Given** I have captured demo details, **When** I review the Opportunity, **Then** I see a summary of all captured information formatted for easy reference during proposal creation
5. **Given** I'm entering demo details side-by-side with EDIprod, **When** both applications are open, **Then** all demo fields are visible and accessible without scrolling horizontally

---

### User Story 5 - Reporting and Analytics (Priority: P5)

As a sales professional, I need to see reports on my pipeline health, lead age, activity summary, and win/loss rates so I can understand my performance and identify areas needing attention.

**Why this priority**: Provides strategic insights but the system is functional without it. Should be built after core tracking and pipeline features are stable.

**Independent Test**: Can be tested by creating leads in various stages with different ages and values, then viewing each report type. Delivers value through performance visibility.

**Acceptance Scenarios**:

1. **Given** I have leads across multiple stages, **When** I view the Pipeline Value report, **Then** I see total estimated value broken down by stage with stage conversion rates
2. **Given** I have leads of varying ages, **When** I view the Lead Age report, **Then** I see a list of leads sorted by time in current stage, with visual indicators for leads stagnating (>14 days in same stage)
3. **Given** I have activity over the past week, **When** I generate the Weekly Activity Summary, **Then** I see counts of new leads, stage progressions, demos conducted, proposals sent, and deals won/lost
4. **Given** I have closed deals (won and lost), **When** I view the Win/Loss Analysis report, **Then** I see win rate percentage, average deal size, common lost reasons, and average sales cycle length
5. **Given** I need to share a report, **When** I click export, **Then** I can download the report as PDF or CSV

---

### Edge Cases

- **What happens when a lead has no follow-up date set?** System should show a warning indicator and prompt user to set one, but not block viewing or editing the lead
- **What happens when a user tries to move a lead backward in the pipeline (e.g., from Demo to Inquiry)?** System should allow it but log a note in the activity history and optionally prompt for a reason
- **How does the system handle duplicate leads (same company/contact)?** System should detect potential duplicates during entry and show a warning with option to link to existing lead or create new
- **What happens when a lead has been in the same stage for >30 days?** System should highlight it as stale and suggest either advancing, closing as lost, or adding a note explaining the delay
- **How does the narrow-screen layout handle very long company names or contact names?** Text should truncate with ellipsis and show full text on hover, ensuring layout doesn't break
- **What happens if a user forgets to log demo details immediately?** System should send a reminder 24 hours after demo date if no notes have been added
- **How does the system handle leads with missing required information?** Each stage should have minimum required fields, and the system should prevent stage advancement until those fields are populated (with option to override and add note)

## Requirements *(mandatory)*

### Functional Requirements

**Core Lead Management**
- **FR-001**: System MUST allow users to manually create new leads with minimum fields: company name, contact person name, phone number, email address
- **FR-002**: System MUST support optional fields during lead creation: contact title, company description, lead source, initial notes
- **FR-003**: System MUST allow users to view all leads in a searchable, filterable list view
- **FR-004**: System MUST provide full-text search across company name, contact name, phone, email, and notes, returning results within 1 second for up to 1000 leads
- **FR-005**: System MUST support the following lead stages: Inquiry, Qualification, Opportunity, Demo Scheduled, Demo Complete, Proposal Sent, Negotiation, Closed-Won, Closed-Lost
- **FR-006**: System MUST allow users to manually update lead stage via dropdown or drag-and-drop interface
- **FR-007**: System MUST track stage history with timestamps for each stage transition

**Follow-up and Reminder Management**
- **FR-008**: System MUST allow users to set follow-up dates and times for each lead
- **FR-009**: System MUST automatically suggest follow-up dates based on stage: Inquiry (24 hours), Qualification (48 hours), Opportunity (3 days), Demo Scheduled (1 day before demo), Demo Complete (1 day), Proposal Sent (3 days), Negotiation (2 days)
- **FR-010**: System MUST display leads with upcoming follow-ups (today or overdue) prominently on the dashboard
- **FR-011**: System MUST visually indicate overdue follow-ups with number of days overdue
- **FR-012**: System MUST allow users to log follow-up activities with date, type (call, email, meeting), and notes
- **FR-013**: System MUST maintain an activity history for each lead showing all logged activities in chronological order

**Pipeline Visualization**
- **FR-014**: System MUST provide a kanban-style pipeline view with columns representing each active stage (excluding Closed-Won and Closed-Lost)
- **FR-015**: System MUST allow users to drag lead cards between stage columns to update lead stage
- **FR-016**: System MUST display key information on each lead card: company name, contact name, estimated value (if set), days in current stage, next follow-up date
- **FR-017**: System MUST show aggregate metrics for each pipeline stage: count of leads, total estimated value

**Opportunity Tracking**
- **FR-018**: System MUST capture organization details when converting Inquiry to Opportunity: company industry, employee count, decision timeline, key stakeholders
- **FR-019**: System MUST allow users to schedule demos with date, time, and optional meeting link
- **FR-020**: System MUST capture demo details: user count, required modules (as checkboxes or multi-select), cardlock business volume, demo notes
- **FR-021**: System MUST allow users to set estimated deal value at any stage
- **FR-022**: System MUST allow users to attach or link to proposal documents
- **FR-023**: System MUST track negotiation notes and objections for leads in Negotiation stage

**Reporting**
- **FR-024**: System MUST generate Pipeline Value report showing total estimated value by stage with stage conversion rates
- **FR-025**: System MUST generate Lead Age report showing leads sorted by time in current stage with visual indicators for stale leads (>14 days)
- **FR-026**: System MUST generate Weekly Activity Summary showing counts of: new leads, stage progressions, demos conducted, proposals sent, deals closed (won/lost)
- **FR-027**: System MUST generate Win/Loss Analysis report showing: win rate percentage, average deal size for won deals, top lost reasons, average sales cycle length
- **FR-028**: System MUST allow users to export reports as PDF or CSV

**User Experience**
- **FR-029**: System MUST support a narrow-screen layout (400-600px width) that remains fully functional and readable when displayed side-by-side with EDIprod
- **FR-030**: System MUST provide a quick-entry form for rapid lead creation from email information, minimizing required fields and keyboard navigation
- **FR-031**: System MUST provide a "Focus View" or priority dashboard showing the top 5-10 leads requiring immediate attention, ranked by: overdue follow-ups, high estimated value, approaching decision date
- **FR-032**: System MUST detect potential duplicate leads during creation and display a warning with option to view existing lead or proceed with creation
- **FR-033**: System MUST require minimum information per stage before allowing stage advancement, with option to override and add explanatory note

### Key Entities

- **Lead**: Represents a potential customer opportunity. Core attributes include: unique identifier, company name, contact person name, title, phone, email, lead source, current stage, stage history, estimated value, creation date, last modified date. Related to: Activities, Organization Details, Demo Details, Proposal, Notes.

- **Activity**: Represents a logged interaction or follow-up. Attributes include: unique identifier, lead reference, activity type (call, email, meeting, note), activity date/time, description, created by, next follow-up date. Related to: Lead.

- **Organization Details**: Represents detailed information about the prospect's organization, captured during Opportunity stage. Attributes include: lead reference, industry, employee count, decision timeline, key stakeholders (array), specific needs, current solution (if applicable). Related to: Lead.

- **Demo Details**: Represents information gathered during product demonstration. Attributes include: lead reference, demo date/time, user count estimate, required modules (array), cardlock volume, demo notes, attendees, follow-up items. Related to: Lead.

- **Proposal**: Represents a quote or proposal sent to prospect. Attributes include: lead reference, proposal date, estimated value, proposal document reference/URL, valid until date, proposal status (sent, viewed, accepted, rejected). Related to: Lead.

- **Stage**: Enumerated type representing position in sales pipeline: Inquiry, Qualification, Opportunity, Demo Scheduled, Demo Complete, Proposal Sent, Negotiation, Closed-Won, Closed-Lost. Each stage has associated default follow-up timing and required fields.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new lead from email information in under 30 seconds using the quick-entry form
- **SC-002**: Users can locate any lead in the system within 5 seconds using search functionality
- **SC-003**: System displays follow-up reminders and overdue indicators on dashboard load within 2 seconds
- **SC-004**: Zero leads fall through the cracks - all leads have assigned follow-up dates and overdue leads are visually highlighted
- **SC-005**: Users can view and interact with the system in a narrow window (400-600px width) without horizontal scrolling or loss of functionality
- **SC-006**: Pipeline visualization accurately reflects current lead distribution across all stages with counts and total values
- **SC-007**: Weekly Activity Summary report can be generated in under 3 seconds
- **SC-008**: Win/Loss Analysis report accurately calculates win rate, average deal size, and average sales cycle length from historical lead data
- **SC-009**: User can complete the full workflow (create lead, qualify, schedule demo, capture demo details, send proposal, close deal) without referencing external documentation
- **SC-010**: System supports at least 500 active leads with search and reporting performance under 3 seconds

### Assumptions

- User has basic web browser (modern Chrome, Firefox, Safari, or Edge) with JavaScript enabled
- User will manually enter lead information from emails - no automated email parsing in Phase 1
- User will manually keep EDIprod synchronized - no automated data sync
- Single-user system in Phase 1 (no multi-user collaboration or access control required)
- Estimated deal values and timelines are user-entered estimates, not calculated from external sources
- Lead sources are manually selected from predefined list (e.g., Website Inquiry, Phone Call, Referral, Trade Show, Other)
- Cardlock volume and module requirements are organization-specific terms that user understands
- Proposals are stored as external files with reference links, not generated within the system (Phase 1)
- Reports are generated on-demand, not scheduled or automated
- System will be accessed from desktop/laptop, not mobile devices (responsive design limited to narrow desktop window, not phone-sized screens)
- User is comfortable with standard web application interactions (forms, drag-and-drop, search)
- Data retention is indefinite - closed deals remain in system for historical reporting

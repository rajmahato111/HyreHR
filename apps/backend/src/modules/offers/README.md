# Offers Module

The Offers module handles the complete offer lifecycle from creation to acceptance, including approval workflows, e-signature integration via DocuSign, and HRIS handoff for onboarding.

## Features

### 1. Offer Management
- Create, read, update, and delete offers
- Support for multiple offer statuses (draft, pending approval, approved, sent, accepted, declined, expired, withdrawn)
- Comprehensive offer details including salary, bonus, equity, benefits, and start date
- Custom fields for organization-specific data

### 2. Approval Workflows
- Configurable multi-step approval workflows
- Sequential approval process with multiple approvers
- Approval/rejection with comments
- Automatic status transitions based on approval state

### 3. Offer Templates
- Create reusable offer letter templates
- Variable substitution for personalization
- Template management (create, update, delete, activate/deactivate)
- Default settings for currency, benefits, and expiry days

### 4. E-Signature Integration (DocuSign)
- Send offers via DocuSign for electronic signature
- Automatic document generation
- Webhook support for status updates
- Track signature status (sent, completed, declined, voided)

### 5. HRIS Integration
- Seamless handoff to HRIS systems on offer acceptance
- Support for multiple HRIS providers:
  - BambooHR
  - Workday
  - Rippling
- Automatic employee record creation
- Bi-directional data sync
- Onboarding workflow triggering

## API Endpoints

### Offers

#### Create Offer
```
POST /offers
```
Creates a new offer for an application.

**Request Body:**
```json
{
  "applicationId": "uuid",
  "jobTitle": "Senior Software Engineer",
  "salary": 150000,
  "currency": "USD",
  "bonus": 20000,
  "equity": {
    "type": "stock_options",
    "amount": 10000,
    "vestingSchedule": "4 years with 1 year cliff"
  },
  "startDate": "2025-01-15",
  "benefits": "Health, dental, vision insurance...",
  "approvalWorkflow": [
    {
      "userId": "uuid",
      "order": 1
    },
    {
      "userId": "uuid",
      "order": 2
    }
  ],
  "expiryDays": 7
}
```

#### Get All Offers
```
GET /offers
```
Returns all offers for the organization.

#### Get Offer by ID
```
GET /offers/:id
```
Returns a specific offer with full details.

#### Get Offer by Application
```
GET /offers/application/:applicationId
```
Returns the offer for a specific application.

#### Update Offer
```
PUT /offers/:id
```
Updates an offer (only draft or pending approval offers can be updated).

#### Approve Offer
```
POST /offers/:id/approve
```
Approves an offer in the approval workflow.

**Request Body:**
```json
{
  "comments": "Approved with recommended compensation"
}
```

#### Reject Offer
```
POST /offers/:id/reject
```
Rejects an offer in the approval workflow.

**Request Body:**
```json
{
  "comments": "Salary exceeds budget"
}
```

#### Send Offer
```
POST /offers/:id/send
```
Sends an approved offer to the candidate.

#### Send Offer via DocuSign
```
POST /offers/:id/send-docusign
```
Sends an approved offer via DocuSign for e-signature.

**Request Body:**
```json
{
  "message": "Please review and sign the attached offer letter"
}
```

#### Accept Offer
```
POST /offers/:id/accept
```
Marks an offer as accepted (typically called by candidate).

#### Decline Offer
```
POST /offers/:id/decline
```
Marks an offer as declined (typically called by candidate).

#### Withdraw Offer
```
POST /offers/:id/withdraw
```
Withdraws an offer.

#### Delete Offer
```
DELETE /offers/:id
```
Deletes a draft offer.

### Offer Templates

#### Create Template
```
POST /offers/templates
```
Creates a new offer template.

**Request Body:**
```json
{
  "name": "Standard Software Engineer Offer",
  "description": "Template for software engineering positions",
  "content": "Dear {{candidateName}},\n\nWe are pleased to offer you...",
  "variables": ["candidateName", "jobTitle", "salary", "startDate"],
  "defaultCurrency": "USD",
  "defaultBenefits": "Health, dental, vision...",
  "expiryDays": 7
}
```

#### Get All Templates
```
GET /offers/templates
```
Returns all offer templates.

#### Get Active Templates
```
GET /offers/templates/active
```
Returns only active templates.

#### Get Template by ID
```
GET /offers/templates/:id
```
Returns a specific template.

#### Update Template
```
PUT /offers/templates/:id
```
Updates an offer template.

#### Delete Template
```
DELETE /offers/templates/:id
```
Deletes an offer template.

### HRIS Integration

#### Handoff to HRIS
```
POST /offers/:id/handoff-hris?provider=bamboohr
```
Hands off an accepted offer to HRIS for onboarding.

**Query Parameters:**
- `provider`: HRIS provider (bamboohr, workday, rippling)

#### Get HRIS Status
```
GET /offers/:id/hris-status
```
Returns the HRIS handoff status.

**Response:**
```json
{
  "offerId": "uuid",
  "provider": "bamboohr",
  "externalEmployeeId": "12345",
  "status": "completed",
  "handoffAt": "2025-01-15T10:00:00Z"
}
```

#### Get Employee from HRIS
```
GET /offers/:id/hris-employee
```
Retrieves employee data from the HRIS system.

#### Sync to HRIS
```
PUT /offers/:id/sync-hris
```
Syncs updated employee data to the HRIS system.

**Request Body:**
```json
{
  "jobTitle": "Senior Software Engineer II",
  "department": "Engineering"
}
```

### Webhooks

#### DocuSign Webhook
```
POST /offers/webhooks/docusign
```
Receives status updates from DocuSign.

## Offer Status Flow

```
draft → pending_approval → approved → sent → accepted
                                    ↓
                                 declined
                                    ↓
                                 expired
```

Any status can transition to `withdrawn` (except accepted/declined).

## Approval Workflow

1. Offer is created with approval workflow
2. Status is set to `pending_approval`
3. First approver in order receives notification
4. Approver can approve or reject
5. If approved, next approver is notified
6. If all approve, status changes to `approved`
7. If any reject, status returns to `draft` for revision

## E-Signature Flow

1. Offer must be in `approved` status
2. Call `/offers/:id/send-docusign`
3. System generates PDF and sends via DocuSign
4. Candidate receives email with signing link
5. DocuSign sends webhook updates on status changes
6. When completed, offer status updates to `accepted`

## HRIS Integration Flow

1. Offer must be in `accepted` status
2. Call `/offers/:id/handoff-hris?provider=bamboohr`
3. System creates employee record in HRIS
4. Employee ID is stored in offer custom fields
5. Onboarding workflow is triggered (if supported)
6. Data can be synced bidirectionally

## Configuration

### Environment Variables

```env
# DocuSign
DOCUSIGN_ACCOUNT_ID=your_account_id
DOCUSIGN_USER_ID=your_user_id
DOCUSIGN_INTEGRATION_KEY=your_integration_key
DOCUSIGN_PRIVATE_KEY=your_private_key
DOCUSIGN_BASE_URL=https://demo.docusign.net/restapi

# BambooHR
BAMBOOHR_API_KEY=your_api_key
BAMBOOHR_SUBDOMAIN=your_subdomain

# Workday
WORKDAY_USERNAME=your_username
WORKDAY_PASSWORD=your_password
WORKDAY_TENANT=your_tenant

# Rippling
RIPPLING_API_KEY=your_api_key
RIPPLING_BASE_URL=https://api.rippling.com/v1
```

## Database Schema

### offers table
- `id`: UUID primary key
- `application_id`: Foreign key to applications
- `template_id`: Foreign key to offer_templates (optional)
- `status`: Offer status enum
- `job_title`: Position title
- `salary`: Base salary amount
- `currency`: Currency code (default: USD)
- `bonus`: Bonus amount (optional)
- `equity`: JSONB equity details (optional)
- `start_date`: Proposed start date
- `benefits`: Benefits description
- `notes`: Internal notes
- `approval_workflow`: JSONB approval workflow
- `sent_at`: Timestamp when sent
- `expires_at`: Expiration timestamp
- `accepted_at`: Acceptance timestamp
- `declined_at`: Decline timestamp
- `withdrawn_at`: Withdrawal timestamp
- `docusign_envelope_id`: DocuSign envelope ID
- `docusign_status`: DocuSign status
- `custom_fields`: JSONB for custom data
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

### offer_templates table
- `id`: UUID primary key
- `organization_id`: Foreign key to organizations
- `name`: Template name
- `description`: Template description
- `content`: Template content with variables
- `variables`: Array of variable names
- `default_currency`: Default currency
- `default_benefits`: Default benefits text
- `expiry_days`: Default expiry days
- `created_by`: Foreign key to users
- `active`: Active status
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

## Usage Examples

### Creating an Offer with Approval Workflow

```typescript
const offer = await offersService.create({
  applicationId: 'app-uuid',
  jobTitle: 'Senior Software Engineer',
  salary: 150000,
  currency: 'USD',
  bonus: 20000,
  equity: {
    type: 'stock_options',
    amount: 10000,
    vestingSchedule: '4 years with 1 year cliff'
  },
  startDate: '2025-01-15',
  approvalWorkflow: [
    { userId: 'hiring-manager-uuid', order: 1 },
    { userId: 'vp-engineering-uuid', order: 2 }
  ],
  expiryDays: 7
}, userId);
```

### Sending Offer via DocuSign

```typescript
const offer = await offersService.sendWithDocuSign(offerId, {
  message: 'Congratulations! Please review and sign your offer letter.'
});
```

### Handing Off to HRIS

```typescript
const handoff = await hrisIntegrationService.handoffToHRIS(
  offerId,
  HRISProvider.BAMBOOHR
);

console.log(`Employee created in BambooHR: ${handoff.externalEmployeeId}`);
```

## Error Handling

The module throws appropriate HTTP exceptions:
- `NotFoundException`: Offer or template not found
- `BadRequestException`: Invalid operation (e.g., updating sent offer)
- `ForbiddenException`: User not authorized for action

## Testing

Run tests with:
```bash
npm test -- offers
```

## Future Enhancements

- [ ] Offer comparison view
- [ ] Offer analytics and metrics
- [ ] Bulk offer operations
- [ ] Offer negotiation tracking
- [ ] Integration with additional HRIS providers
- [ ] Custom approval workflow builder UI
- [ ] Offer letter PDF generation improvements
- [ ] Multi-language offer templates

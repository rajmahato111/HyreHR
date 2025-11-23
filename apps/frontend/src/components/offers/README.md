# Offer Management UI

This module provides a comprehensive user interface for managing job offers in the recruiting platform.

## Components

### OfferForm
A form component for creating and editing job offers.

**Features:**
- Template selection for quick offer creation
- Compensation details (salary, bonus, equity)
- Benefits and start date configuration
- Offer expiry settings
- Support for multiple currencies

**Props:**
- `applicationId?: string` - Pre-fill application ID
- `offer?: Offer` - Existing offer for editing
- `onSubmit?: (offer: Offer) => void` - Callback on successful submission
- `onCancel?: () => void` - Callback on cancel

**Usage:**
```tsx
<OfferForm 
  applicationId="app-123"
  onSubmit={(offer) => console.log('Offer created:', offer)}
/>
```

### OfferApprovalPanel
Displays the approval workflow and allows approvers to approve or reject offers.

**Features:**
- Visual approval chain with status indicators
- Approve/reject actions for authorized users
- Comments support for approval decisions
- Sequential approval workflow enforcement

**Props:**
- `offer: Offer` - The offer to display approval workflow for
- `currentUserId: string` - Current user's ID for permission checks
- `onApprovalChange?: (offer: Offer) => void` - Callback when approval status changes

**Usage:**
```tsx
<OfferApprovalPanel 
  offer={offer}
  currentUserId={currentUser.id}
  onApprovalChange={(updatedOffer) => setOffer(updatedOffer)}
/>
```

### OfferComparison
Side-by-side comparison of multiple offers.

**Features:**
- Compare compensation packages
- View benefits and equity details
- Track offer status and timeline
- Calculate total compensation

**Props:**
- `offers: Offer[]` - Array of offers to compare

**Usage:**
```tsx
<OfferComparison offers={[offer1, offer2, offer3]} />
```

### OffersDashboard
Main dashboard for tracking all offers with metrics and filtering.

**Features:**
- Summary metrics (total offers, acceptance rate, avg. time to accept)
- Status breakdown visualization
- Filterable offers list
- Quick actions for each offer

**Usage:**
```tsx
<OffersDashboard />
```

### OfferDetail
Detailed view of a single offer with actions.

**Features:**
- Complete compensation package display
- Timeline of offer events
- Send offer to candidate
- Withdraw offer functionality

**Props:**
- `offer: Offer` - The offer to display
- `currentUserId?: string` - Current user's ID
- `onUpdate?: (offer: Offer) => void` - Callback when offer is updated

**Usage:**
```tsx
<OfferDetail 
  offer={offer}
  onUpdate={(updatedOffer) => setOffer(updatedOffer)}
/>
```

## Pages

### OffersPage
Main offers listing page with dashboard.

**Route:** `/offers`

### CreateOfferPage
Page for creating a new offer.

**Route:** `/offers/new`
**Query Params:** `?applicationId=xxx` - Pre-fill application

### OfferDetailPage
Detailed view of a specific offer.

**Route:** `/offers/:id`

### EditOfferPage
Page for editing an existing offer.

**Route:** `/offers/:id/edit`

### OfferComparisonPage
Page for comparing multiple offers side by side.

**Route:** `/offers/compare?ids=id1,id2,id3`

## API Integration

The UI integrates with the backend offers API through the `offersService`:

```typescript
import offersService from '../services/offers';

// Get all offers
const offers = await offersService.getOffers();

// Create offer
const newOffer = await offersService.createOffer({
  applicationId: 'app-123',
  jobTitle: 'Senior Engineer',
  salary: 150000,
  currency: 'USD',
});

// Approve offer
const approved = await offersService.approveOffer(offerId, {
  comments: 'Looks good!',
});

// Send offer
const sent = await offersService.sendOffer(offerId, {
  recipientEmail: 'candidate@example.com',
  recipientName: 'John Doe',
  message: 'Congratulations!',
});
```

## Types

All TypeScript types are defined in `types/offer.ts`:

- `Offer` - Main offer entity
- `OfferStatus` - Enum for offer statuses
- `OfferApprover` - Approval workflow participant
- `EquityDetails` - Equity compensation details
- `CreateOfferDto` - DTO for creating offers
- `UpdateOfferDto` - DTO for updating offers
- `SendOfferDto` - DTO for sending offers

## Styling

Components use Tailwind CSS for styling with a consistent design system:

- Primary color: Blue (600/700)
- Success: Green (600/700)
- Warning: Yellow (600/700)
- Danger: Red (600/700)
- Neutral: Gray (50-900)

## Requirements Coverage

This implementation satisfies the following requirements from the spec:

- **Requirement 9.1:** Offer letter templates with variables for salary, bonus, equity, start date, and benefits
- **Requirement 9.2:** Approval workflow routing through configured approvers
- **Requirement 9.4:** Offer status tracking (draft, pending approval, approved, sent, accepted, declined, expired)

## Future Enhancements

- Real-time updates via WebSocket
- Offer letter PDF generation
- Email template customization
- Bulk offer operations
- Advanced analytics and reporting
- Integration with e-signature providers (DocuSign)
- HRIS handoff automation

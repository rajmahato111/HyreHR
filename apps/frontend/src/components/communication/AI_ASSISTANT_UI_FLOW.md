# AI Email Assistant - UI Flow

## Visual Component Structure

```
EmailComposer
├── Header
│   ├── Title: "New Email"
│   └── Close Button (X)
│
├── Content Area
│   ├── Error Alert (if any)
│   │
│   ├── Template & AI Section
│   │   ├── [Use Template] Button
│   │   └── [✨ AI Assistant] Button ← NEW
│   │
│   ├── AI Assistant Panel (when open) ← NEW
│   │   ├── Header with Sparkle Icon
│   │   ├── Tone Selector
│   │   │   ├── [Professional] Button
│   │   │   ├── [Friendly] Button
│   │   │   └── [Casual] Button
│   │   ├── Additional Context Textarea
│   │   └── [Generate Email with AI] Button
│   │
│   ├── Email Fields
│   │   ├── To: (email chips)
│   │   ├── Cc: (optional)
│   │   ├── Bcc: (optional)
│   │   ├── Subject:
│   │   └── Body: (textarea)
│   │
│   └── Attachments (if any)
│
└── Footer
    ├── Left Actions
    │   ├── [Attach Files]
    │   └── [Preview]
    └── Right Actions
        ├── [Cancel]
        └── [Send]

AI Preview Modal (when generated) ← NEW
├── Header (gradient purple/blue)
│   ├── Sparkle Icon + "AI Generated Email"
│   └── Close Button (X)
│
├── Content
│   ├── Info Banner (blue)
│   ├── Subject Preview (gray box)
│   ├── Body Preview (gray box, scrollable)
│   └── Tone Badge (purple box)
│
└── Footer
    ├── [🔄 Regenerate] Button
    └── Right Actions
        ├── [Cancel]
        ├── [✏️ Edit & Use]
        └── [✨ Use This Email]
```

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Opens Email Composer                                │
│    - Click "Compose Email" button                           │
│    - EmailComposer modal appears                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. User Clicks "AI Assistant" Button                        │
│    - AI Assistant panel slides open                         │
│    - Shows tone selector and context input                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. User Selects Tone                                        │
│    - Clicks Professional/Friendly/Casual                    │
│    - Selected button highlights in purple                   │
│    - Description text updates                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. User Adds Context (Optional)                             │
│    - Types additional details in textarea                   │
│    - Can include specific requirements or notes             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. User Clicks "Generate Email with AI"                     │
│    - Button shows "Generating..." with disabled state       │
│    - API call made to backend                               │
│    - Loading spinner appears                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. AI Preview Modal Appears                                 │
│    - Shows generated subject and body                       │
│    - Displays tone used                                     │
│    - Info banner explains AI generation                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. User Reviews Content                                     │
│    - Reads subject and body                                 │
│    - Decides on action                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┬───────────────┐
         │           │           │               │
         ▼           ▼           ▼               ▼
    ┌────────┐  ┌────────┐  ┌────────┐    ┌──────────┐
    │Regenera│  │Edit &  │  │Use This│    │  Cancel  │
    │   te   │  │  Use   │  │ Email  │    │          │
    └────┬───┘  └────┬───┘  └────┬───┘    └──────────┘
         │           │           │
         │           │           │
         ▼           ▼           ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │ Back to│  │Content │  │Content │
    │ Step 5 │  │inserted│  │inserted│
    │        │  │Can edit│  │Ready to│
    │        │  │        │  │  send  │
    └────────┘  └────────┘  └────────┘
```

## State Transitions

```
Initial State
    ↓
[AI Assistant Closed]
    ↓ (Click "AI Assistant")
[AI Assistant Open]
    ↓ (Select tone, add context)
[Ready to Generate]
    ↓ (Click "Generate")
[Generating...] (Loading)
    ↓ (API Success)
[Preview Modal Open]
    ↓
    ├─→ (Click "Regenerate") → [Generating...] (Loop)
    ├─→ (Click "Edit & Use") → [Content in Composer] → [AI Assistant Closed]
    ├─→ (Click "Use This Email") → [Content in Composer] → [AI Assistant Closed]
    └─→ (Click "Cancel") → [AI Assistant Open]
```

## Component Interactions

```
┌──────────────────────────────────────────────────────────────┐
│                      EmailComposer                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         AI Assistant Panel (Collapsible)           │    │
│  │                                                     │    │
│  │  State: showAIAssistant                            │    │
│  │  Controls: aiTone, aiAdditionalContext             │    │
│  │                                                     │    │
│  │  Actions:                                          │    │
│  │  - handleGenerateAIEmail() → API Call             │    │
│  │  - setShowAIPreview(true) → Open Modal            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Email Form Fields                      │    │
│  │                                                     │    │
│  │  State: subject, body, toEmails, etc.              │    │
│  │                                                     │    │
│  │  Updated by:                                       │    │
│  │  - handleAcceptAIContent()                         │    │
│  │  - handleEditAIContent()                           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   AI Preview Modal                           │
│                                                              │
│  State: showAIPreview, aiGeneratedContent                   │
│                                                              │
│  Actions:                                                    │
│  - handleRegenerateAIEmail() → New API Call                 │
│  - handleAcceptAIContent() → Update EmailComposer           │
│  - handleEditAIContent() → Update EmailComposer             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Color Scheme

### AI Assistant Theme
- **Primary**: Purple (#9333EA - purple-600)
- **Secondary**: Blue (#2563EB - blue-600)
- **Gradient**: Purple-50 to Blue-50
- **Accent**: Sparkle icon (✨)

### States
- **Active/Selected**: Purple-600 background, white text
- **Hover**: Purple-700 / Gray-100
- **Disabled**: Gray-300 background
- **Loading**: Spinning animation on icons

### Feedback
- **Success**: Blue-50 background, blue-800 text
- **Error**: Red-50 background, red-700 text
- **Info**: Purple-50 background, purple-900 text

## Responsive Behavior

### Desktop (>1024px)
- Full-width modal (max-w-4xl)
- Side-by-side tone buttons
- Spacious padding and margins

### Tablet (768px - 1024px)
- Slightly narrower modal (max-w-3xl)
- Tone buttons remain side-by-side
- Reduced padding

### Mobile (<768px)
- Full-screen modal
- Stacked tone buttons
- Compact spacing
- Scrollable content areas

## Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Enter to activate buttons
- Escape to close modals
- Arrow keys for tone selection

### Screen Readers
- Descriptive button labels
- ARIA labels for icons
- Status announcements for loading states
- Clear heading hierarchy

### Visual
- High contrast colors
- Clear focus indicators
- Sufficient touch targets (44px minimum)
- Readable font sizes (14px minimum)

## Animation & Transitions

### Panel Open/Close
- Smooth slide-in animation
- 200ms transition duration
- Ease-in-out timing function

### Button States
- Hover: 150ms color transition
- Active: Scale down slightly (0.98)
- Loading: Continuous spin animation

### Modal Appearance
- Fade-in background overlay
- Scale-up modal content
- 300ms total animation time

## Error States

### API Errors
```
┌─────────────────────────────────────────┐
│ ⚠️ Failed to generate email with AI     │
│                                         │
│ [Error message from API]                │
│                                         │
│ [Try Again Button]                      │
└─────────────────────────────────────────┘
```

### Validation Errors
- Missing required fields highlighted
- Inline error messages
- Prevent form submission

### Network Errors
- Retry mechanism
- Timeout handling
- Offline detection

## Performance Considerations

### Optimization
- Debounce context input
- Lazy load AI tones
- Memoize generated content
- Cancel pending requests on unmount

### Loading States
- Skeleton screens for preview
- Progressive content loading
- Optimistic UI updates

### Caching
- Cache tone options
- Store recent generations
- Persist user preferences

# Career Site Module

The Career Site module provides a complete solution for building and managing public-facing career sites, application portals, and candidate self-service portals.

## Features

### 1. Career Site Builder
- Drag-and-drop page builder with customizable branding
- Company branding (logo, colors, fonts, header images)
- Content sections (hero, about, benefits, values, testimonials)
- SEO settings (title, description, keywords, OG image)
- Job listing page with search and filters
- Employee testimonials section
- Custom sections support

### 2. Application Portal
- Custom application form builder
- Dynamic form fields (text, email, phone, textarea, select, file, date, etc.)
- Screening questions with disqualifying answers
- Resume upload with parsing integration
- Cover letter support
- EEO questionnaire (voluntary)
- Job-specific or default forms

### 3. Candidate Portal
- Candidate login and registration
- Application status tracking
- Interview schedule display
- Document upload interface
- Real-time updates on application progress

## API Endpoints

### Admin Endpoints (Authenticated)

#### Career Sites
- `POST /career-sites` - Create a new career site
- `GET /career-sites` - List all career sites
- `GET /career-sites/:id` - Get career site details
- `PUT /career-sites/:id` - Update career site
- `DELETE /career-sites/:id` - Delete career site
- `POST /career-sites/:id/publish` - Publish career site
- `POST /career-sites/:id/unpublish` - Unpublish career site

#### Application Forms
- `POST /career-sites/application-forms` - Create application form
- `GET /career-sites/application-forms` - List all forms
- `GET /career-sites/application-forms/:id` - Get form details
- `PUT /career-sites/application-forms/:id` - Update form
- `DELETE /career-sites/application-forms/:id` - Delete form

### Public Endpoints (No Authentication)

#### Career Site
- `GET /career-sites/public/:slug` - Get public career site
- `GET /career-sites/public/:slug/jobs` - List public jobs
- `GET /career-sites/public/:slug/jobs/:jobId` - Get job details
- `GET /career-sites/public/:slug/jobs/:jobId/application-form` - Get application form
- `POST /career-sites/public/:slug/applications` - Submit application

#### Candidate Portal
- `POST /career-sites/portal/register` - Register candidate portal account
- `POST /career-sites/portal/login` - Login to candidate portal
- `GET /career-sites/portal/applications` - Get candidate applications (authenticated)
- `GET /career-sites/portal/interviews` - Get candidate interviews (authenticated)
- `POST /career-sites/portal/documents` - Upload documents (authenticated)

## Database Schema

### career_sites
- `id` - UUID primary key
- `organization_id` - Organization reference
- `name` - Career site name
- `slug` - URL slug (unique)
- `published` - Published status
- `branding` - JSONB (logo, colors, fonts, images)
- `content` - JSONB (hero, about, benefits, testimonials, custom sections)
- `seo` - JSONB (title, description, keywords, og_image)
- `settings` - JSONB (job count, filters, search, pagination)

### application_forms
- `id` - UUID primary key
- `organization_id` - Organization reference
- `job_id` - Optional job reference
- `name` - Form name
- `is_default` - Default form flag
- `fields` - JSONB array of custom fields
- `screening_questions` - JSONB array of screening questions
- `include_resume` - Resume required flag
- `include_cover_letter` - Cover letter flag
- `include_eeo` - EEO questionnaire flag
- `eeo_config` - JSONB EEO configuration

### candidate_portal_users
- `id` - UUID primary key
- `candidate_id` - Candidate reference (unique)
- `email` - Email address
- `password_hash` - Hashed password
- `active` - Active status
- `last_login` - Last login timestamp
- `reset_token` - Password reset token
- `reset_token_expires` - Token expiration
- `verification_token` - Email verification token
- `email_verified` - Email verified flag

## Usage Examples

### Creating a Career Site

```typescript
const careerSite = await careerSiteService.create(organizationId, {
  name: 'Acme Careers',
  slug: 'acme-careers',
  published: true,
  branding: {
    logo: 'https://example.com/logo.png',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    fontFamily: 'Inter',
    headerImage: 'https://example.com/header.jpg',
  },
  content: {
    heroTitle: 'Join Our Team',
    heroSubtitle: 'Build the future with us',
    aboutCompany: 'We are a leading technology company...',
    benefits: ['Health Insurance', 'Remote Work', '401k Matching'],
    testimonials: [
      {
        id: '1',
        name: 'John Doe',
        role: 'Software Engineer',
        quote: 'Best place I\'ve ever worked!',
        order: 0,
      },
    ],
  },
  seo: {
    title: 'Careers at Acme Corp',
    description: 'Join our team and help build amazing products',
    keywords: ['jobs', 'careers', 'technology'],
  },
  settings: {
    showJobCount: true,
    enableFilters: true,
    enableSearch: true,
    jobsPerPage: 20,
  },
});
```

### Creating an Application Form

```typescript
const form = await applicationFormService.create(organizationId, {
  name: 'Standard Application Form',
  isDefault: true,
  fields: [
    {
      id: 'linkedin',
      type: 'text',
      label: 'LinkedIn Profile',
      required: false,
      order: 0,
    },
    {
      id: 'portfolio',
      type: 'url',
      label: 'Portfolio URL',
      required: false,
      order: 1,
    },
  ],
  screeningQuestions: [
    {
      id: 'work_auth',
      question: 'Are you authorized to work in the US?',
      type: 'boolean',
      required: true,
      disqualifyingAnswers: ['no'],
      order: 0,
    },
  ],
  includeResume: true,
  includeCoverLetter: false,
  includeEEO: true,
});
```

### Submitting an Application

```typescript
const result = await publicCareerSiteService.submitApplication(slug, {
  jobId: 'job-uuid',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  phone: '+1234567890',
  resumeUrl: 'https://example.com/resume.pdf',
  customFields: {
    linkedin: 'https://linkedin.com/in/janesmith',
  },
  screeningAnswers: [
    {
      questionId: 'work_auth',
      answer: 'yes',
    },
  ],
  eeoData: {
    gender: 'Female',
    ethnicity: 'Asian',
  },
});
```

## Frontend Components

### CareerSiteBuilder
Admin component for building and customizing career sites with tabs for branding, content, SEO, and settings.

### ApplicationFormBuilder
Admin component for creating custom application forms with drag-and-drop field builder.

### PublicJobListing
Public-facing component displaying job listings with search, filters, and pagination.

### PublicApplicationForm
Public-facing application form with dynamic fields, screening questions, and EEO questionnaire.

### CandidatePortalLogin
Login interface for candidates to access their portal.

### CandidatePortalDashboard
Candidate dashboard showing applications, interviews, and document upload.

## Requirements Covered

This implementation covers the following requirements from the spec:

- **Requirement 10.1**: Customizable career site builder with company branding, job listings, and employee testimonials
- **Requirement 10.2**: Custom application form builder with screening questions and EEO questionnaire
- **Requirement 10.3**: Candidate portal for application status tracking and interview schedule display

## Integration Points

- **Resume Parser Module**: Automatically parses uploaded resumes
- **Jobs Module**: Fetches open positions for career site
- **Applications Module**: Creates applications from submissions
- **Interviews Module**: Displays scheduled interviews in candidate portal
- **Candidates Module**: Manages candidate data and profiles

## Security Considerations

- Public endpoints are marked with `@Public()` decorator
- Candidate portal uses JWT authentication
- Passwords are hashed with bcrypt
- EEO data is stored separately and marked as voluntary
- GDPR consent is captured during application submission
- Career site slugs are unique to prevent conflicts

## Future Enhancements

- Video interview integration
- Application analytics and conversion tracking
- A/B testing for career site content
- Multi-language support
- Advanced page builder with more section types
- Integration with job boards for automatic posting
- Candidate referral program
- Social media sharing for job postings

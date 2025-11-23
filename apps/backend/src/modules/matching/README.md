# Candidate Matching Module

This module provides AI-powered candidate-job matching capabilities for the recruiting platform. It calculates match scores based on multiple factors including skills, experience, education, location, and job title similarity.

## Features

### 1. Skill Matching
- **Skill Taxonomy**: Comprehensive skill taxonomy with 100+ skills across multiple categories
- **Synonym Recognition**: Recognizes skill synonyms (e.g., "JS" = "JavaScript", "ReactJS" = "React")
- **Related Skills**: Identifies related skills (e.g., "React" is related to "JavaScript", "TypeScript")
- **Scoring**:
  - Exact match: 100 points
  - Synonym match: 90 points
  - Related skill: 70 points
  - Missing required skill: 0 points
  - Matched preferred skill: +10 bonus points

### 2. Experience Matching
- **Level-Based Matching**: Maps years of experience to seniority levels
- **Flexible Scoring**: Accounts for overqualified and underqualified candidates
- **Scoring**:
  - Exact level match: 100 points
  - One level above: 90 points
  - Two levels above: 80 points
  - One level below: 70 points
  - Two levels below: 50 points

### 3. Education Matching
- **Degree Level Matching**: Compares education levels (High School → Doctorate)
- **Field of Study**: Matches related fields (e.g., Computer Science ≈ Software Engineering)
- **Scoring**:
  - Meets or exceeds requirement: 100 points
  - One level below: 70 points
  - Two levels below: 40 points
  - Field match bonus: +10 points

### 4. Location Matching
- **Geographic Matching**: Compares candidate and job locations
- **Remote Support**: Full score for remote positions
- **Scoring**:
  - Exact location match: 100 points
  - Same state/region: 80 points
  - Same country: 60 points
  - Remote position: 100 points
  - No match: 30 points

### 5. Title Matching
- **Title Similarity**: Compares job titles using synonym and seniority analysis
- **Seniority Extraction**: Identifies seniority levels in titles
- **Scoring**:
  - Exact match: 100 points
  - Synonym match: 90 points
  - Same role, different seniority: 70-85 points
  - Related role: 60 points
  - Different role: 30 points

### 6. Overall Match Score
- **Weighted Scoring**: Combines all factors with configurable weights
- **Default Weights**:
  - Skills: 40%
  - Experience: 25%
  - Education: 15%
  - Location: 10%
  - Title: 10%
- **Skill Gap Analysis**: Identifies missing required skills
- **Match Reasons**: Generates human-readable explanations

## API Endpoints

### Calculate Match Score
```http
POST /matching/calculate
Content-Type: application/json

{
  "candidateId": "uuid",
  "jobId": "uuid",
  "skillsWeight": 0.4,
  "experienceWeight": 0.25,
  "educationWeight": 0.15,
  "locationWeight": 0.1,
  "titleWeight": 0.1
}
```

### Calculate Job Matches
```http
POST /matching/job-matches
Content-Type: application/json

{
  "jobId": "uuid",
  "candidateIds": ["uuid1", "uuid2"],
  "skillsWeight": 0.4
}
```

### Update Application Match Score
```http
POST /matching/application/:id/update-score
```

### Calculate Skill Match
```http
POST /matching/skills/calculate
Content-Type: application/json

{
  "candidateSkills": ["JavaScript", "React", "Node.js"],
  "requiredSkills": ["JavaScript", "TypeScript", "React"],
  "preferredSkills": ["GraphQL", "Docker"]
}
```

### Extract Skills from Text
```http
POST /matching/skills/extract
Content-Type: application/json

{
  "text": "Experienced software engineer with JavaScript, React, and Node.js..."
}
```

### Normalize Skills
```http
POST /matching/skills/normalize
Content-Type: application/json

{
  "skills": ["JS", "ReactJS", "nodejs"]
}
```

### Get Skill Suggestions
```http
POST /matching/skills/suggestions
Content-Type: application/json

{
  "skills": ["JavaScript", "React"],
  "limit": 5
}
```

### Get Title Suggestions
```http
GET /matching/titles/:title/suggestions
```

## Usage Examples

### Basic Match Calculation
```typescript
const matchScore = await candidateMatchingService.calculateMatch(
  candidateId,
  jobId
);

console.log(`Overall Match: ${matchScore.overall}%`);
console.log(`Skill Match: ${matchScore.breakdown.skills.score}%`);
console.log(`Missing Skills: ${matchScore.skillGaps.join(', ')}`);
console.log(`Match Reasons: ${matchScore.matchReasons.join(', ')}`);
```

### Custom Weights
```typescript
const matchScore = await candidateMatchingService.calculateMatch(
  candidateId,
  jobId,
  {
    skills: 0.5,      // Increase skills weight to 50%
    experience: 0.3,  // Increase experience weight to 30%
    education: 0.1,
    location: 0.05,
    title: 0.05,
  }
);
```

### Rank Candidates for a Job
```typescript
const matches = await candidateMatchingService.calculateMatchesForJob(jobId);

// Results are automatically sorted by overall score
matches.forEach(match => {
  console.log(`${match.candidate.firstName} ${match.candidate.lastName}: ${match.matchScore.overall}%`);
});
```

### Update Application Match Score
```typescript
// Calculate and store match score in application custom fields
await candidateMatchingService.updateApplicationMatchScore(applicationId);

// The match score is now stored in application.customFields.matchScore
```

## Data Requirements

### Candidate Data
The matching algorithm expects the following data in candidate records:

```typescript
{
  currentTitle: string,
  locationCity: string,
  locationState: string,
  locationCountry: string,
  tags: string[], // Skills
  customFields: {
    skills: string[],
    yearsOfExperience: number,
    workHistory: Array<{
      startDate: Date,
      endDate?: Date
    }>,
    education: Array<{
      level: EducationLevel,
      field?: string,
      institution?: string,
      graduationYear?: number
    }>
  }
}
```

### Job Data
The matching algorithm expects the following data in job records:

```typescript
{
  title: string,
  seniorityLevel: SeniorityLevel,
  remoteOk: boolean,
  locations: Location[],
  customFields: {
    requiredSkills: string[],
    preferredSkills: string[],
    requiredYearsOfExperience: number,
    requiredEducation: EducationLevel,
    requiredField?: string
  }
}
```

## Integration with Resume Parser

The matching module integrates with the resume parser to automatically extract skills:

```typescript
// After parsing a resume
const parsedData = await resumeParserService.parseResume(file);

// Extract and normalize skills
const skills = skillMatchingService.extractSkills(parsedData.text);
const normalizedSkills = skillMatchingService.normalizeSkills(skills);

// Store in candidate record
candidate.customFields.skills = normalizedSkills;
```

## Integration with Applications

When a candidate applies for a job, automatically calculate the match score:

```typescript
// In applications.service.ts
async createApplication(dto: CreateApplicationDto) {
  const application = await this.applicationRepository.save({
    candidateId: dto.candidateId,
    jobId: dto.jobId,
    // ... other fields
  });

  // Calculate and store match score
  await this.candidateMatchingService.updateApplicationMatchScore(application.id);

  return application;
}
```

## Performance Considerations

- **Caching**: Match scores are stored in application custom fields to avoid recalculation
- **Batch Processing**: Use `calculateMatchesForJob()` for bulk matching
- **Async Processing**: Consider using a job queue for large-scale matching operations
- **Indexing**: Ensure proper database indexes on candidate and job fields

## Future Enhancements

- Machine learning-based matching using historical hiring data
- Semantic skill matching using embeddings
- Industry-specific skill taxonomies
- Configurable matching rules per organization
- A/B testing for different matching algorithms
- Real-time match score updates when candidate or job data changes

## Requirements Mapping

This implementation satisfies the following requirements:

- **Requirement 12.1**: Calculate match score based on skills, experience, education, location, and title
- **Requirement 12.2**: Provide skill gap analysis
- **Requirement 12.3**: Use synonym matching for skills
- **Requirement 12.4**: Rank candidates by match score
- **Requirement 12.5**: Provide explanations for match scores

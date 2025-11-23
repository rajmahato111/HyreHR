/**
 * Skill Taxonomy and Synonym Mapping
 * 
 * This module provides a comprehensive skill taxonomy with synonym mappings
 * and related skill relationships for candidate-job matching.
 */

export interface SkillNode {
  canonical: string;
  synonyms: string[];
  related: string[];
  category: string;
}

export class SkillTaxonomy {
  private skillMap: Map<string, SkillNode>;
  private normalizedIndex: Map<string, string>; // normalized -> canonical

  constructor() {
    this.skillMap = new Map();
    this.normalizedIndex = new Map();
    this.initializeTaxonomy();
  }

  private initializeTaxonomy(): void {
    // Programming Languages
    this.addSkill({
      canonical: 'JavaScript',
      synonyms: ['JS', 'ECMAScript', 'Javascript', 'javascript'],
      related: ['TypeScript', 'Node.js', 'React', 'Vue.js'],
      category: 'Programming Languages',
    });

    this.addSkill({
      canonical: 'TypeScript',
      synonyms: ['TS', 'Typescript', 'typescript'],
      related: ['JavaScript', 'Node.js', 'React', 'Angular'],
      category: 'Programming Languages',
    });

    this.addSkill({
      canonical: 'Python',
      synonyms: ['python', 'Python3', 'Python 3'],
      related: ['Django', 'Flask', 'FastAPI', 'Machine Learning'],
      category: 'Programming Languages',
    });

    this.addSkill({
      canonical: 'Java',
      synonyms: ['java', 'JAVA'],
      related: ['Spring', 'Spring Boot', 'Hibernate', 'Maven'],
      category: 'Programming Languages',
    });

    this.addSkill({
      canonical: 'C#',
      synonyms: ['CSharp', 'C Sharp', 'csharp'],
      related: ['.NET', 'ASP.NET', 'Entity Framework'],
      category: 'Programming Languages',
    });

    this.addSkill({
      canonical: 'Go',
      synonyms: ['Golang', 'golang', 'GO'],
      related: ['Docker', 'Kubernetes', 'Microservices'],
      category: 'Programming Languages',
    });

    this.addSkill({
      canonical: 'Ruby',
      synonyms: ['ruby', 'RUBY'],
      related: ['Ruby on Rails', 'Rails', 'RSpec'],
      category: 'Programming Languages',
    });

    // Frontend Frameworks
    this.addSkill({
      canonical: 'React',
      synonyms: ['ReactJS', 'React.js', 'react'],
      related: ['JavaScript', 'TypeScript', 'Redux', 'Next.js'],
      category: 'Frontend Frameworks',
    });

    this.addSkill({
      canonical: 'Angular',
      synonyms: ['AngularJS', 'Angular.js', 'angular'],
      related: ['TypeScript', 'RxJS', 'NgRx'],
      category: 'Frontend Frameworks',
    });

    this.addSkill({
      canonical: 'Vue.js',
      synonyms: ['Vue', 'VueJS', 'vue'],
      related: ['JavaScript', 'TypeScript', 'Vuex', 'Nuxt.js'],
      category: 'Frontend Frameworks',
    });

    // Backend Frameworks
    this.addSkill({
      canonical: 'Node.js',
      synonyms: ['NodeJS', 'Node', 'node.js', 'nodejs'],
      related: ['JavaScript', 'TypeScript', 'Express', 'NestJS'],
      category: 'Backend Frameworks',
    });

    this.addSkill({
      canonical: 'Express',
      synonyms: ['ExpressJS', 'Express.js', 'express'],
      related: ['Node.js', 'JavaScript', 'REST API'],
      category: 'Backend Frameworks',
    });

    this.addSkill({
      canonical: 'NestJS',
      synonyms: ['Nest.js', 'Nest', 'nestjs'],
      related: ['Node.js', 'TypeScript', 'Express', 'Microservices'],
      category: 'Backend Frameworks',
    });

    this.addSkill({
      canonical: 'Django',
      synonyms: ['django', 'Django Framework'],
      related: ['Python', 'REST API', 'PostgreSQL'],
      category: 'Backend Frameworks',
    });

    this.addSkill({
      canonical: 'Spring Boot',
      synonyms: ['SpringBoot', 'Spring', 'spring boot'],
      related: ['Java', 'Microservices', 'REST API'],
      category: 'Backend Frameworks',
    });

    // Databases
    this.addSkill({
      canonical: 'PostgreSQL',
      synonyms: ['Postgres', 'postgres', 'postgresql', 'PSQL'],
      related: ['SQL', 'Database Design', 'Relational Databases'],
      category: 'Databases',
    });

    this.addSkill({
      canonical: 'MySQL',
      synonyms: ['mysql', 'My SQL'],
      related: ['SQL', 'Database Design', 'Relational Databases'],
      category: 'Databases',
    });

    this.addSkill({
      canonical: 'MongoDB',
      synonyms: ['mongo', 'mongodb', 'Mongo DB'],
      related: ['NoSQL', 'Database Design', 'Document Databases'],
      category: 'Databases',
    });

    this.addSkill({
      canonical: 'Redis',
      synonyms: ['redis', 'REDIS'],
      related: ['Caching', 'NoSQL', 'In-Memory Databases'],
      category: 'Databases',
    });

    this.addSkill({
      canonical: 'Elasticsearch',
      synonyms: ['ElasticSearch', 'Elastic Search', 'elasticsearch'],
      related: ['Search', 'NoSQL', 'Full-Text Search'],
      category: 'Databases',
    });

    // Cloud Platforms
    this.addSkill({
      canonical: 'AWS',
      synonyms: ['Amazon Web Services', 'aws', 'Amazon AWS'],
      related: ['Cloud Computing', 'EC2', 'S3', 'Lambda'],
      category: 'Cloud Platforms',
    });

    this.addSkill({
      canonical: 'Azure',
      synonyms: ['Microsoft Azure', 'azure', 'MS Azure'],
      related: ['Cloud Computing', 'Azure Functions', 'Azure DevOps'],
      category: 'Cloud Platforms',
    });

    this.addSkill({
      canonical: 'Google Cloud',
      synonyms: ['GCP', 'Google Cloud Platform', 'gcp'],
      related: ['Cloud Computing', 'BigQuery', 'Cloud Functions'],
      category: 'Cloud Platforms',
    });

    // DevOps & Tools
    this.addSkill({
      canonical: 'Docker',
      synonyms: ['docker', 'Containerization'],
      related: ['Kubernetes', 'DevOps', 'Microservices'],
      category: 'DevOps',
    });

    this.addSkill({
      canonical: 'Kubernetes',
      synonyms: ['K8s', 'k8s', 'kubernetes'],
      related: ['Docker', 'DevOps', 'Container Orchestration'],
      category: 'DevOps',
    });

    this.addSkill({
      canonical: 'Git',
      synonyms: ['git', 'Version Control'],
      related: ['GitHub', 'GitLab', 'Bitbucket'],
      category: 'DevOps',
    });

    this.addSkill({
      canonical: 'CI/CD',
      synonyms: ['Continuous Integration', 'Continuous Deployment', 'CI CD'],
      related: ['Jenkins', 'GitHub Actions', 'GitLab CI'],
      category: 'DevOps',
    });

    // Testing
    this.addSkill({
      canonical: 'Jest',
      synonyms: ['jest', 'Jest Testing'],
      related: ['JavaScript', 'TypeScript', 'Unit Testing'],
      category: 'Testing',
    });

    this.addSkill({
      canonical: 'Pytest',
      synonyms: ['pytest', 'PyTest'],
      related: ['Python', 'Unit Testing', 'Test Automation'],
      category: 'Testing',
    });

    this.addSkill({
      canonical: 'JUnit',
      synonyms: ['junit', 'JUnit Testing'],
      related: ['Java', 'Unit Testing', 'Test Automation'],
      category: 'Testing',
    });

    // Soft Skills
    this.addSkill({
      canonical: 'Leadership',
      synonyms: ['Team Leadership', 'Leading Teams', 'leadership'],
      related: ['Management', 'Communication', 'Mentoring'],
      category: 'Soft Skills',
    });

    this.addSkill({
      canonical: 'Communication',
      synonyms: ['communication', 'Verbal Communication', 'Written Communication'],
      related: ['Collaboration', 'Presentation', 'Documentation'],
      category: 'Soft Skills',
    });

    this.addSkill({
      canonical: 'Problem Solving',
      synonyms: ['Problem-Solving', 'Analytical Thinking', 'Critical Thinking'],
      related: ['Debugging', 'Troubleshooting', 'Analysis'],
      category: 'Soft Skills',
    });

    // Methodologies
    this.addSkill({
      canonical: 'Agile',
      synonyms: ['agile', 'Agile Development', 'Agile Methodology'],
      related: ['Scrum', 'Kanban', 'Sprint Planning'],
      category: 'Methodologies',
    });

    this.addSkill({
      canonical: 'Scrum',
      synonyms: ['scrum', 'SCRUM'],
      related: ['Agile', 'Sprint Planning', 'Daily Standup'],
      category: 'Methodologies',
    });

    this.addSkill({
      canonical: 'REST API',
      synonyms: ['RESTful API', 'REST', 'RESTful', 'API Development'],
      related: ['HTTP', 'JSON', 'API Design'],
      category: 'Methodologies',
    });

    this.addSkill({
      canonical: 'GraphQL',
      synonyms: ['graphql', 'Graph QL'],
      related: ['API Development', 'Apollo', 'REST API'],
      category: 'Methodologies',
    });

    // Machine Learning & AI
    this.addSkill({
      canonical: 'Machine Learning',
      synonyms: ['ML', 'machine learning', 'Machine learning'],
      related: ['Python', 'TensorFlow', 'PyTorch', 'Data Science'],
      category: 'AI/ML',
    });

    this.addSkill({
      canonical: 'TensorFlow',
      synonyms: ['tensorflow', 'Tensor Flow'],
      related: ['Machine Learning', 'Python', 'Deep Learning'],
      category: 'AI/ML',
    });

    this.addSkill({
      canonical: 'PyTorch',
      synonyms: ['pytorch', 'Py Torch'],
      related: ['Machine Learning', 'Python', 'Deep Learning'],
      category: 'AI/ML',
    });
  }

  private addSkill(skill: SkillNode): void {
    this.skillMap.set(skill.canonical, skill);
    
    // Index canonical name
    this.normalizedIndex.set(this.normalize(skill.canonical), skill.canonical);
    
    // Index all synonyms
    for (const synonym of skill.synonyms) {
      this.normalizedIndex.set(this.normalize(synonym), skill.canonical);
    }
  }

  private normalize(skill: string): string {
    return skill.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  }

  /**
   * Find the canonical skill name for a given skill string
   */
  findCanonical(skill: string): string | null {
    const normalized = this.normalize(skill);
    return this.normalizedIndex.get(normalized) || null;
  }

  /**
   * Get skill node by canonical name
   */
  getSkill(canonical: string): SkillNode | null {
    return this.skillMap.get(canonical) || null;
  }

  /**
   * Check if a skill is a synonym of another
   */
  isSynonym(skill1: string, skill2: string): boolean {
    const canonical1 = this.findCanonical(skill1);
    const canonical2 = this.findCanonical(skill2);
    return canonical1 !== null && canonical1 === canonical2;
  }

  /**
   * Check if two skills are related
   */
  isRelated(skill1: string, skill2: string): boolean {
    const canonical1 = this.findCanonical(skill1);
    const canonical2 = this.findCanonical(skill2);
    
    if (!canonical1 || !canonical2) return false;
    if (canonical1 === canonical2) return true;
    
    const node1 = this.getSkill(canonical1);
    return node1 ? node1.related.includes(canonical2) : false;
  }

  /**
   * Get all skills in a category
   */
  getSkillsByCategory(category: string): string[] {
    const skills: string[] = [];
    for (const [canonical, node] of this.skillMap.entries()) {
      if (node.category === category) {
        skills.push(canonical);
      }
    }
    return skills;
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    for (const node of this.skillMap.values()) {
      categories.add(node.category);
    }
    return Array.from(categories);
  }
}

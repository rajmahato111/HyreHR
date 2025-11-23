import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { Candidate } from '../../database/entities/candidate.entity';

export interface CandidateSearchQuery {
  query?: string;
  skills?: string[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  experience?: {
    minYears?: number;
    maxYears?: number;
  };
  tags?: string[];
  booleanQuery?: string;
}

export interface CandidateSearchResult {
  candidates: Candidate[];
  total: number;
  facets?: {
    skills: Array<{ value: string; count: number }>;
    locations: Array<{ value: string; count: number }>;
    companies: Array<{ value: string; count: number }>;
  };
}

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client: Client;
  private readonly indexName = 'candidates';

  constructor(private configService: ConfigService) {
    const node = this.configService.get<string>(
      'ELASTICSEARCH_NODE',
      'http://localhost:9200',
    );

    this.client = new Client({
      node,
      auth: {
        username: this.configService.get<string>('ELASTICSEARCH_USERNAME', 'elastic'),
        password: this.configService.get<string>('ELASTICSEARCH_PASSWORD', ''),
      },
    });
  }

  async onModuleInit() {
    try {
      // Check if Elasticsearch is available
      await this.client.ping();
      this.logger.log('Connected to Elasticsearch');

      // Create index if it doesn't exist
      await this.createIndexIfNotExists();
    } catch (error) {
      this.logger.warn(
        'Failed to connect to Elasticsearch. Search functionality will be limited.',
        error,
      );
    }
  }

  private async createIndexIfNotExists() {
    try {
      const exists = await this.client.indices.exists({
        index: this.indexName,
      });

      if (!exists) {
        await this.client.indices.create({
          index: this.indexName,
          body: {
            settings: {
              analysis: {
                analyzer: {
                  email_analyzer: {
                    type: 'custom',
                    tokenizer: 'uax_url_email',
                    filter: ['lowercase'],
                  },
                },
              },
            },
            mappings: {
              properties: {
                id: { type: 'keyword' },
                organizationId: { type: 'keyword' },
                firstName: { type: 'text' },
                lastName: { type: 'text' },
                email: {
                  type: 'text',
                  analyzer: 'email_analyzer',
                  fields: {
                    keyword: { type: 'keyword' },
                  },
                },
                currentTitle: { type: 'text' },
                currentCompany: {
                  type: 'text',
                  fields: {
                    keyword: { type: 'keyword' },
                  },
                },
                skills: { type: 'text' },
                tags: { type: 'keyword' },
                location: {
                  properties: {
                    city: {
                      type: 'text',
                      fields: {
                        keyword: { type: 'keyword' },
                      },
                    },
                    state: { type: 'keyword' },
                    country: { type: 'keyword' },
                  },
                },
                resumeText: { type: 'text' },
                createdAt: { type: 'date' },
              },
            },
          },
        });

        this.logger.log(`Created Elasticsearch index: ${this.indexName}`);
      }
    } catch (error) {
      this.logger.error('Failed to create Elasticsearch index', error);
    }
  }

  async indexCandidate(candidate: Candidate): Promise<void> {
    try {
      await this.client.index({
        index: this.indexName,
        id: candidate.id,
        document: {
          id: candidate.id,
          organizationId: candidate.organizationId,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          currentTitle: candidate.currentTitle,
          currentCompany: candidate.currentCompany,
          tags: candidate.tags,
          location: {
            city: candidate.locationCity,
            state: candidate.locationState,
            country: candidate.locationCountry,
          },
          createdAt: candidate.createdAt,
        },
      });

      this.logger.debug(`Indexed candidate: ${candidate.id}`);
    } catch (error) {
      this.logger.error(`Failed to index candidate: ${candidate.id}`, error);
    }
  }

  async updateCandidate(candidate: Candidate): Promise<void> {
    await this.indexCandidate(candidate);
  }

  async deleteCandidate(candidateId: string): Promise<void> {
    try {
      await this.client.delete({
        index: this.indexName,
        id: candidateId,
      });

      this.logger.debug(`Deleted candidate from index: ${candidateId}`);
    } catch (error) {
      if (error.meta?.statusCode !== 404) {
        this.logger.error(
          `Failed to delete candidate from index: ${candidateId}`,
          error,
        );
      }
    }
  }

  async search(
    searchQuery: CandidateSearchQuery,
    organizationId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<CandidateSearchResult> {
    try {
      const must: any[] = [
        { term: { organizationId } },
      ];

      // Handle boolean query if provided
      if (searchQuery.booleanQuery) {
        must.push({
          query_string: {
            query: searchQuery.booleanQuery,
            fields: [
              'firstName^2',
              'lastName^2',
              'email',
              'currentTitle^1.5',
              'currentCompany',
              'skills',
            ],
            default_operator: 'AND',
          },
        });
      } else if (searchQuery.query) {
        // Simple multi-match query
        must.push({
          multi_match: {
            query: searchQuery.query,
            fields: [
              'firstName^2',
              'lastName^2',
              'email',
              'currentTitle^1.5',
              'currentCompany',
              'skills',
            ],
            type: 'best_fields',
            fuzziness: 'AUTO',
          },
        });
      }

      // Location filters
      if (searchQuery.location?.city) {
        must.push({
          match: {
            'location.city': searchQuery.location.city,
          },
        });
      }

      if (searchQuery.location?.state) {
        must.push({
          term: {
            'location.state': searchQuery.location.state,
          },
        });
      }

      if (searchQuery.location?.country) {
        must.push({
          term: {
            'location.country': searchQuery.location.country,
          },
        });
      }

      // Tags filter
      if (searchQuery.tags && searchQuery.tags.length > 0) {
        must.push({
          terms: {
            tags: searchQuery.tags,
          },
        });
      }

      // Skills filter
      if (searchQuery.skills && searchQuery.skills.length > 0) {
        must.push({
          multi_match: {
            query: searchQuery.skills.join(' '),
            fields: ['skills'],
            type: 'best_fields',
          },
        });
      }

      const from = (page - 1) * limit;

      const response = await this.client.search({
        index: this.indexName,
        body: {
          from,
          size: limit,
          query: {
            bool: {
              must,
            },
          },
          aggs: {
            top_companies: {
              terms: {
                field: 'currentCompany.keyword',
                size: 10,
              },
            },
            top_locations: {
              terms: {
                field: 'location.city.keyword',
                size: 10,
              },
            },
            top_tags: {
              terms: {
                field: 'tags',
                size: 20,
              },
            },
          },
        },
      });

      const hits = response.hits.hits;
      const total = typeof response.hits.total === 'number'
        ? response.hits.total
        : response.hits.total.value;

      const candidates = hits.map((hit: any) => hit._source as Candidate);

      const facets = {
        skills: (response.aggregations?.top_tags as any)?.buckets?.map((b: any) => ({
          value: b.key,
          count: b.doc_count,
        })) || [],
        locations: (response.aggregations?.top_locations as any)?.buckets?.map((b: any) => ({
          value: b.key,
          count: b.doc_count,
        })) || [],
        companies: (response.aggregations?.top_companies as any)?.buckets?.map((b: any) => ({
          value: b.key,
          count: b.doc_count,
        })) || [],
      };

      return {
        candidates,
        total,
        facets,
      };
    } catch (error) {
      this.logger.error('Elasticsearch search failed', error);
      return {
        candidates: [],
        total: 0,
      };
    }
  }

  async bulkIndex(candidates: Candidate[]): Promise<void> {
    if (candidates.length === 0) return;

    try {
      const operations = candidates.flatMap((candidate) => [
        { index: { _index: this.indexName, _id: candidate.id } },
        {
          id: candidate.id,
          organizationId: candidate.organizationId,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          currentTitle: candidate.currentTitle,
          currentCompany: candidate.currentCompany,
          tags: candidate.tags,
          location: {
            city: candidate.locationCity,
            state: candidate.locationState,
            country: candidate.locationCountry,
          },
          createdAt: candidate.createdAt,
        },
      ]);

      const response = await this.client.bulk({
        operations,
      });

      if (response.errors) {
        this.logger.error('Bulk indexing had errors', response.items);
      } else {
        this.logger.log(`Bulk indexed ${candidates.length} candidates`);
      }
    } catch (error) {
      this.logger.error('Bulk indexing failed', error);
    }
  }
}

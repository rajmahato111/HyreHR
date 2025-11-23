import { SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';

export class QueryOptimizerHelper {
  /**
   * Apply pagination to a query builder
   */
  static applyPagination<T>(
    queryBuilder: SelectQueryBuilder<T>,
    pagination: PaginationDto,
  ): SelectQueryBuilder<T> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const offset = (page - 1) * limit;

    return queryBuilder
      .orderBy(`${queryBuilder.alias}.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC')
      .skip(offset)
      .take(limit);
  }

  /**
   * Apply field selection to reduce data transfer
   */
  static applyFieldSelection<T>(
    queryBuilder: SelectQueryBuilder<T>,
    fields?: string[],
  ): SelectQueryBuilder<T> {
    if (!fields || fields.length === 0) {
      return queryBuilder;
    }

    // Clear existing selections and add only requested fields
    const alias = queryBuilder.alias;
    const selections = fields.map(field => `${alias}.${field}`);
    
    return queryBuilder.select(selections);
  }

  /**
   * Apply eager loading for relations to avoid N+1 queries
   */
  static applyEagerLoading<T>(
    queryBuilder: SelectQueryBuilder<T>,
    relations: string[],
  ): SelectQueryBuilder<T> {
    relations.forEach(relation => {
      queryBuilder.leftJoinAndSelect(`${queryBuilder.alias}.${relation}`, relation);
    });
    return queryBuilder;
  }

  /**
   * Apply search filter with full-text search
   */
  static applyFullTextSearch<T>(
    queryBuilder: SelectQueryBuilder<T>,
    searchTerm: string,
    searchFields: string[],
  ): SelectQueryBuilder<T> {
    if (!searchTerm || searchFields.length === 0) {
      return queryBuilder;
    }

    const alias = queryBuilder.alias;
    const searchVector = searchFields
      .map(field => `COALESCE(${alias}.${field}, '')`)
      .join(` || ' ' || `);

    queryBuilder.andWhere(
      `to_tsvector('english', ${searchVector}) @@ plainto_tsquery('english', :searchTerm)`,
      { searchTerm },
    );

    return queryBuilder;
  }

  /**
   * Apply date range filter
   */
  static applyDateRange<T>(
    queryBuilder: SelectQueryBuilder<T>,
    field: string,
    startDate?: Date,
    endDate?: Date,
  ): SelectQueryBuilder<T> {
    const alias = queryBuilder.alias;

    if (startDate) {
      queryBuilder.andWhere(`${alias}.${field} >= :startDate`, { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere(`${alias}.${field} <= :endDate`, { endDate });
    }

    return queryBuilder;
  }

  /**
   * Apply filters with proper indexing hints
   */
  static applyFilters<T>(
    queryBuilder: SelectQueryBuilder<T>,
    filters: Record<string, any>,
  ): SelectQueryBuilder<T> {
    const alias = queryBuilder.alias;

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (Array.isArray(value)) {
        queryBuilder.andWhere(`${alias}.${key} IN (:...${key})`, { [key]: value });
      } else if (typeof value === 'object' && value.operator) {
        // Support for complex filters like { operator: 'gte', value: 100 }
        const operators = {
          eq: '=',
          ne: '!=',
          gt: '>',
          gte: '>=',
          lt: '<',
          lte: '<=',
          like: 'LIKE',
          ilike: 'ILIKE',
        };
        const op = operators[value.operator] || '=';
        queryBuilder.andWhere(`${alias}.${key} ${op} :${key}`, { [key]: value.value });
      } else {
        queryBuilder.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
      }
    });

    return queryBuilder;
  }

  /**
   * Get query execution plan for debugging
   */
  static async explainQuery<T>(
    queryBuilder: SelectQueryBuilder<T>,
  ): Promise<any> {
    const [query, parameters] = queryBuilder.getQueryAndParameters();
    const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
    
    const result = await queryBuilder.connection.query(explainQuery, parameters);
    return result[0]['QUERY PLAN'];
  }

  /**
   * Optimize query with query hints
   */
  static addQueryHints<T>(
    queryBuilder: SelectQueryBuilder<T>,
    hints: {
      useIndex?: string;
      forceSeqScan?: boolean;
      parallel?: boolean;
    },
  ): SelectQueryBuilder<T> {
    // PostgreSQL doesn't support query hints directly, but we can use settings
    if (hints.forceSeqScan) {
      queryBuilder.setParameter('enable_seqscan', 'on');
      queryBuilder.setParameter('enable_indexscan', 'off');
    }

    if (hints.parallel) {
      queryBuilder.setParameter('max_parallel_workers_per_gather', '4');
    }

    return queryBuilder;
  }

  /**
   * Batch load related entities to avoid N+1 queries
   */
  static async batchLoadRelations<T, R>(
    entities: T[],
    relationKey: keyof T,
    loader: (ids: any[]) => Promise<R[]>,
    idKey: keyof T,
  ): Promise<void> {
    const ids = entities.map(entity => entity[idKey]);
    const relations = await loader(ids);
    
    const relationMap = new Map<any, R>();
    relations.forEach((relation: any) => {
      relationMap.set(relation.id, relation);
    });

    entities.forEach(entity => {
      const relationId = entity[idKey];
      entity[relationKey] = relationMap.get(relationId) as any;
    });
  }

  /**
   * Create a subquery for efficient filtering
   */
  static createSubquery<T>(
    queryBuilder: SelectQueryBuilder<T>,
    subqueryAlias: string,
    subqueryBuilder: (qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>,
  ): SelectQueryBuilder<T> {
    const subquery = subqueryBuilder(
      queryBuilder.subQuery(),
    ).getQuery();

    queryBuilder.andWhere(`${queryBuilder.alias}.id IN ${subquery}`);
    return queryBuilder;
  }

  /**
   * Apply cursor-based pagination for better performance on large datasets
   */
  static applyCursorPagination<T>(
    queryBuilder: SelectQueryBuilder<T>,
    cursor?: string,
    limit = 20,
    sortField = 'id',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): SelectQueryBuilder<T> {
    const alias = queryBuilder.alias;

    if (cursor) {
      const operator = sortOrder === 'DESC' ? '<' : '>';
      queryBuilder.andWhere(`${alias}.${sortField} ${operator} :cursor`, { cursor });
    }

    return queryBuilder
      .orderBy(`${alias}.${sortField}`, sortOrder)
      .take(limit);
  }
}

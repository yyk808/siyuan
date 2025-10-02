/**
 * Database operations for SiYuan Third-Party Inbox
 */

import { Shorthand, ShorthandEntity, ShorthandsResponse, PaginationInfo, Env } from './types';
import { entityToShorthand, generateId, markdownToHtml, generateDescription } from './utils';

/**
 * Database class for handling all D1 operations
 */
export class Database {
    constructor(private db: D1Database) {}

    /**
     * Get shorthands with pagination
     * @param page - Page number (1-based)
     * @param limit - Items per page
     * @returns Promise<ShorthandsResponse> - Paginated shorthands response
     */
    async getShorthands(page: number = 1, limit: number = 20): Promise<ShorthandsResponse> {
        const offset = (page - 1) * limit;

        // Get total count
        const countResult = await this.db.prepare('SELECT COUNT(*) as total FROM shorthands').first<{ total: number }>();
        const totalRecords = countResult?.total || 0;

        // Get paginated results
        const query = `
            SELECT id, content_html, content_md, description, from_source, title, url, created_at
            FROM shorthands
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;

        const result = await this.db.prepare(query).bind(limit, offset).all<ShorthandEntity>();

        if (!result.success) {
            throw new Error('Failed to fetch shorthands from database');
        }

        const shorthands = result.results.map(entityToShorthand);
        const totalPages = Math.ceil(totalRecords / limit);

        return {
            shorthands,
            pagination: {
                paginationPageCount: totalPages,
                paginationRecordCount: totalRecords
            }
        };
    }

    /**
     * Get a single shorthand by ID
     * @param id - Shorthand ID
     * @returns Promise<Shorthand | null> - Shorthand object or null if not found
     */
    async getShorthand(id: string): Promise<Shorthand | null> {
        const query = `
            SELECT id, content_html, content_md, description, from_source, title, url, created_at
            FROM shorthands
            WHERE id = ?
        `;

        const result = await this.db.prepare(query).bind(id).first<ShorthandEntity>();

        if (!result) {
            return null;
        }

        return entityToShorthand(result);
    }

    /**
     * Create a new shorthand
     * @param contentMd - Markdown content
     * @param title - Shorthand title
     * @param url - Original URL (optional)
     * @param fromSource - Source identifier (optional)
     * @returns Promise<Shorthand> - Created shorthand
     */
    async createShorthand(
        contentMd: string,
        title: string,
        url: string = '',
        fromSource: number = 0
    ): Promise<Shorthand> {
        const id = generateId();
        const createdAt = Date.now();
        const contentHtml = markdownToHtml(contentMd);
        const description = generateDescription(contentHtml);

        const query = `
            INSERT INTO shorthands (id, content_html, content_md, description, from_source, title, url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await this.db.prepare(query).bind(
            id, contentHtml, contentMd, description, fromSource, title, url, createdAt
        ).run();

        if (!result.success) {
            throw new Error('Failed to create shorthand');
        }

        return entityToShorthand({
            id,
            content_html: contentHtml,
            content_md: contentMd,
            description,
            from_source: fromSource,
            title,
            url,
            created_at: createdAt
        });
    }

    /**
     * Delete multiple shorthands by IDs
     * @param ids - Array of IDs to delete
     * @returns Promise<number> - Number of deleted shorthands
     */
    async deleteShorthands(ids: string[]): Promise<number> {
        if (ids.length === 0) {
            return 0;
        }

        const placeholders = ids.map(() => '?').join(',');
        const query = `DELETE FROM shorthands WHERE id IN (${placeholders})`;

        const result = await this.db.prepare(query).bind(...ids).run();

        if (!result.success) {
            throw new Error('Failed to delete shorthands');
        }

        // Cloudflare D1 的 changes 在 meta 中
        return (result as any).meta?.changes || 0;
    }

    /**
     * Get total count of shorthands
     * @returns Promise<number> - Total number of shorthands
     */
    async getShorthandsCount(): Promise<number> {
        const result = await this.db.prepare('SELECT COUNT(*) as total FROM shorthands').first<{ total: number }>();
        return result?.total || 0;
    }

    /**
     * Search shorthands by title or content
     * @param searchTerm - Search term
     * @param page - Page number
     * @param limit - Items per page
     * @returns Promise<ShorthandsResponse> - Search results
     */
    async searchShorthands(searchTerm: string, page: number = 1, limit: number = 20): Promise<ShorthandsResponse> {
        const offset = (page - 1) * limit;
        const searchPattern = `%${searchTerm}%`;

        // Get total count for search results
        const countQuery = `
            SELECT COUNT(*) as total FROM shorthands
            WHERE title LIKE ? OR description LIKE ? OR content_md LIKE ?
        `;
        const countResult = await this.db.prepare(countQuery).bind(searchPattern, searchPattern, searchPattern)
            .first<{ total: number }>();
        const totalRecords = countResult?.total || 0;

        // Get search results
        const query = `
            SELECT id, content_html, content_md, description, from_source, title, url, created_at
            FROM shorthands
            WHERE title LIKE ? OR description LIKE ? OR content_md LIKE ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;

        const result = await this.db.prepare(query)
            .bind(searchPattern, searchPattern, searchPattern, limit, offset)
            .all<ShorthandEntity>();

        if (!result.success) {
            throw new Error('Failed to search shorthands');
        }

        const shorthands = result.results.map(entityToShorthand);
        const totalPages = Math.ceil(totalRecords / limit);

        return {
            shorthands,
            pagination: {
                paginationPageCount: totalPages,
                paginationRecordCount: totalRecords
            }
        };
    }

    /**
     * Initialize database with sample data (for development)
     * @returns Promise<void>
     */
    async initializeSampleData(): Promise<void> {
        // Check if we already have data
        const count = await this.getShorthandsCount();
        if (count > 0) {
            return; // Already has data
        }

        const sampleData = [
            {
                contentMd: 'This is a **sample** inbox item with some *formatted* text.',
                title: 'Sample Item 1',
                url: 'https://example.com/sample1',
                fromSource: 0
            },
            {
                contentMd: '# Sample Heading\n\nThis is another sample item with a heading and some content.',
                title: 'Sample Item 2',
                url: 'https://example.com/sample2',
                fromSource: 1
            },
            {
                contentMd: 'This item contains a [link](https://example.com) and some `code` examples.',
                title: 'Sample Item 3',
                url: 'https://example.com/sample3',
                fromSource: 2
            }
        ];

        for (const item of sampleData) {
            await this.createShorthand(item.contentMd, item.title, item.url, item.fromSource);
        }
    }
}

/**
 * Create database instance from environment
 * @param env - Cloudflare Worker environment
 * @returns Database instance
 */
export function createDatabase(env: Env): Database {
    return new Database(env.siyuan_inbox);
}
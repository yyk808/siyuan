/**
 * API route handlers for SiYuan Third-Party Inbox
 */

import { Database } from './database';
import { Env, ApiResponse, ErrorCode, ERROR_MESSAGES, GetShorthandsRequest, CreateShorthandRequest, DeleteShorthandsRequest } from './types';
import { validateCreateShorthandRequest, validatePaginationParams, setCorsHeaders } from './utils';

/**
 * API response helper
 */
function createApiResponse<T>(
    code: ErrorCode = ErrorCode.SUCCESS,
    msg: string = ERROR_MESSAGES[ErrorCode.SUCCESS],
    data?: T
): ApiResponse<T> {
    return { code, msg, data };
}

/**
 * Handle CORS preflight request
 */
export function handleOptions(): Response {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
            'Access-Control-Max-Age': '86400'
        }
    });
}

/**
 * Handle GET /api/shorthands - Get paginated shorthands
 */
export async function handleGetShorthands(request: Request, env: Env): Promise<Response> {
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');

        // Validate pagination parameters
        const validationError = validatePaginationParams(page, limit);
        if (validationError) {
            return new Response(
                JSON.stringify(createApiResponse(ErrorCode.VALIDATION_ERROR, validationError)),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const database = new Database(env.siyuan_inbox);
        const result = await database.getShorthands(page, limit);

        const response = createApiResponse(ErrorCode.SUCCESS, ERROR_MESSAGES[ErrorCode.SUCCESS], result);

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error in handleGetShorthands:', error);
        return new Response(
            JSON.stringify(createApiResponse(ErrorCode.INTERNAL_ERROR, 'Failed to fetch shorthands')),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

/**
 * Handle GET /api/shorthands/:id - Get single shorthand
 */
export async function handleGetShorthand(request: Request, env: Env, id: string): Promise<Response> {
    try {
        if (!id) {
            return new Response(
                JSON.stringify(createApiResponse(ErrorCode.VALIDATION_ERROR, 'ID is required')),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const database = new Database(env.siyuan_inbox);
        const shorthand = await database.getShorthand(id);

        if (!shorthand) {
            return new Response(
                JSON.stringify(createApiResponse(ErrorCode.NOT_FOUND, 'Shorthand not found')),
                {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const response = createApiResponse(ErrorCode.SUCCESS, ERROR_MESSAGES[ErrorCode.SUCCESS], shorthand);

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error in handleGetShorthand:', error);
        return new Response(
            JSON.stringify(createApiResponse(ErrorCode.INTERNAL_ERROR, 'Failed to fetch shorthand')),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

/**
 * Handle POST /api/shorthands - Create new shorthand
 */
export async function handleCreateShorthand(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json() as CreateShorthandRequest;

        // Validate request data
        const validationError = validateCreateShorthandRequest(body);
        if (validationError) {
            return new Response(
                JSON.stringify(createApiResponse(ErrorCode.VALIDATION_ERROR, validationError)),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const database = new Database(env.siyuan_inbox);
        const shorthand = await database.createShorthand(
            body.content_md,
            body.title,
            body.url || '',
            body.from_source || 0
        );

        const response = createApiResponse(ErrorCode.SUCCESS, 'Shorthand created successfully', shorthand);

        return new Response(JSON.stringify(response), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error in handleCreateShorthand:', error);
        return new Response(
            JSON.stringify(createApiResponse(ErrorCode.INTERNAL_ERROR, 'Failed to create shorthand')),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

/**
 * Handle DELETE /api/shorthands - Delete multiple shorthands
 */
export async function handleDeleteShorthands(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json() as DeleteShorthandsRequest;

        if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
            return new Response(
                JSON.stringify(createApiResponse(ErrorCode.VALIDATION_ERROR, 'ids array is required')),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const database = new Database(env.siyuan_inbox);
        const deletedCount = await database.deleteShorthands(body.ids);

        const response = createApiResponse(
            ErrorCode.SUCCESS,
            `Successfully deleted ${deletedCount} shorthand(s)`,
            { deletedCount }
        );

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error in handleDeleteShorthands:', error);
        return new Response(
            JSON.stringify(createApiResponse(ErrorCode.INTERNAL_ERROR, 'Failed to delete shorthands')),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

/**
 * Handle GET /api/search - Search shorthands
 */
export async function handleSearchShorthands(request: Request, env: Env): Promise<Response> {
    try {
        const url = new URL(request.url);
        const searchTerm = url.searchParams.get('q');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');

        if (!searchTerm || searchTerm.trim().length === 0) {
            return new Response(
                JSON.stringify(createApiResponse(ErrorCode.VALIDATION_ERROR, 'Search term (q) is required')),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Validate pagination parameters
        const validationError = validatePaginationParams(page, limit);
        if (validationError) {
            return new Response(
                JSON.stringify(createApiResponse(ErrorCode.VALIDATION_ERROR, validationError)),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const database = new Database(env.siyuan_inbox);
        const result = await database.searchShorthands(searchTerm.trim(), page, limit);

        const response = createApiResponse(ErrorCode.SUCCESS, ERROR_MESSAGES[ErrorCode.SUCCESS], result);

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error in handleSearchShorthands:', error);
        return new Response(
            JSON.stringify(createApiResponse(ErrorCode.INTERNAL_ERROR, 'Failed to search shorthands')),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

/**
 * Handle GET /api/health - Health check endpoint
 */
export async function handleHealth(request: Request, env: Env): Promise<Response> {
    try {
        console.log('Health check requested');
        console.log('Database binding:', typeof env.siyuan_inbox);

        if (!env.siyuan_inbox) {
            console.error('Database not bound properly');
            throw new Error('Database not bound');
        }

        const database = new Database(env.siyuan_inbox);
        const count = await database.getShorthandsCount();

        const response = createApiResponse(ErrorCode.SUCCESS, 'Service is healthy', {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: {
                connected: true,
                shorthandsCount: count
            }
        });

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error in handleHealth:', error);

        const response = createApiResponse(ErrorCode.INTERNAL_ERROR, 'Service is unhealthy', {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: {
                connected: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        });

        return new Response(JSON.stringify(response), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Handle 404 - Route not found
 */
export function handleNotFound(): Response {
    const response = createApiResponse(ErrorCode.NOT_FOUND, 'API endpoint not found');

    return new Response(JSON.stringify(response), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * Handle generic errors
 */
export function handleError(error: any): Response {
    console.error('Unhandled error:', error);

    const response = createApiResponse(ErrorCode.INTERNAL_ERROR, 'Internal server error');

    return new Response(JSON.stringify(response), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
}
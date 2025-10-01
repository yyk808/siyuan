/**
 * SiYuan Third-Party Inbox Worker
 * Compatible with SiYuan Notes inbox API
 */

import { Env } from './types';
import { requireAuth } from './auth';
import {
    handleOptions,
    handleGetShorthands,
    handleGetShorthand,
    handleCreateShorthand,
    handleDeleteShorthands,
    handleSearchShorthands,
    handleHealth,
    handleNotFound,
    handleError
} from './api';

/**
 * Main fetch handler for the Cloudflare Worker
 */
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        try {
            // Handle CORS preflight requests
            if (request.method === 'OPTIONS') {
                return handleOptions();
            }

            const url = new URL(request.url);
            const path = url.pathname;

            console.log(`[${request.method}] ${path} - ${new Date().toISOString()}`);

            // Route handling
            if (path === '/api/shorthands') {
                if (request.method === 'GET') {
                    // Authentication required for getting shorthands
                    const authResponse = requireAuth(request, env);
                    if (authResponse) return authResponse;

                    return handleGetShorthands(request, env);
                }

                if (request.method === 'POST') {
                    // Authentication required for creating shorthands
                    const authResponse = requireAuth(request, env);
                    if (authResponse) return authResponse;

                    return handleCreateShorthand(request, env);
                }

                if (request.method === 'DELETE') {
                    // Authentication required for deleting shorthands
                    const authResponse = requireAuth(request, env);
                    if (authResponse) return authResponse;

                    return handleDeleteShorthands(request, env);
                }
            }

            // Handle single shorthand GET request
            if (path.startsWith('/api/shorthands/')) {
                if (request.method === 'GET') {
                    // Authentication required for getting single shorthand
                    const authResponse = requireAuth(request, env);
                    if (authResponse) return authResponse;

                    const id = path.split('/')[3]; // Extract ID from path
                    return handleGetShorthand(request, env, id);
                }
            }

            // Handle search endpoint
            if (path === '/api/search') {
                if (request.method === 'GET') {
                    // Authentication required for search
                    const authResponse = requireAuth(request, env);
                    if (authResponse) return authResponse;

                    return handleSearchShorthands(request, env);
                }
            }

            // Handle health check (no authentication required)
            if (path === '/api/health') {
                if (request.method === 'GET') {
                    return handleHealth(request, env);
                }
            }

            // SiYuan-compatible API endpoints
            if (path === '/apis/siyuan/inbox/getCloudShorthands') {
                if (request.method === 'POST') {
                    // Authentication required
                    const authResponse = requireAuth(request, env);
                    if (authResponse) return authResponse;

                    // Extract page from request body or query parameter
                    let page = 1;
                    try {
                        const body = await request.clone().json() as any;
                        page = parseInt(body.p) || 1;
                    } catch {
                        // Try to get page from query parameter
                        page = parseInt(url.searchParams.get('page') || '1');
                    }

                    // Create a new request with page in query params for our handler
                    const newUrl = new URL(url);
                    newUrl.searchParams.set('page', page.toString());
                    const newRequest = new Request(newUrl.toString(), {
                        method: 'GET',
                        headers: request.headers
                    });

                    return handleGetShorthands(newRequest, env);
                }
            }

            if (path === '/apis/siyuan/inbox/getCloudShorthand') {
                if (request.method === 'POST') {
                    // Authentication required
                    const authResponse = requireAuth(request, env);
                    if (authResponse) return authResponse;

                    // Extract ID from request body or query parameter
                    let id = '';
                    try {
                        const body = await request.clone().json() as any;
                        id = body.id || '';
                    } catch {
                        // Try to get ID from query parameter
                        id = url.searchParams.get('id') || '';
                    }

                    return handleGetShorthand(request, env, id);
                }
            }

            if (path === '/apis/siyuan/inbox/removeCloudShorthands') {
                if (request.method === 'POST') {
                    // Authentication required
                    const authResponse = requireAuth(request, env);
                    if (authResponse) return authResponse;

                    return handleDeleteShorthands(request, env);
                }
            }

            // Root endpoint with API info
            if (path === '/' && request.method === 'GET') {
                return new Response(JSON.stringify({
                    name: 'SiYuan Third-Party Inbox',
                    version: '1.0.0',
                    status: 'running',
                    timestamp: new Date().toISOString(),
                    endpoints: {
                        'GET /api/health': 'Health check',
                        'GET /api/shorthands': 'Get paginated shorthands',
                        'GET /api/shorthands/:id': 'Get single shorthand',
                        'POST /api/shorthands': 'Create new shorthand',
                        'DELETE /api/shorthands': 'Delete multiple shorthands',
                        'GET /api/search': 'Search shorthands',
                        'POST /apis/siyuan/inbox/getCloudShorthands': 'SiYuan compatible - Get shorthands',
                        'POST /apis/siyuan/inbox/getCloudShorthand': 'SiYuan compatible - Get single shorthand',
                        'POST /apis/siyuan/inbox/removeCloudShorthands': 'SiYuan compatible - Delete shorthands'
                    }
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // If no route matches, return 404
            return handleNotFound();

        } catch (error) {
            console.error('Worker error:', error);
            return handleError(error);
        }
    },

    // Handle scheduled events (optional)
    async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
        console.log('Scheduled event triggered:', event.cron);

        // You can add cleanup tasks here, such as:
        // - Delete old shorthands
        // - Update statistics
        // - Backup data

        // For now, just log the event
        ctx.waitUntil(Promise.resolve());
    }
};
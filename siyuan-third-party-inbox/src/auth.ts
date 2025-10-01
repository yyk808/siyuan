/**
 * Authentication module for SiYuan Third-Party Inbox
 */

import { Env, ErrorCode, ERROR_MESSAGES } from './types';

/**
 * Authentication result interface
 */
export interface AuthResult {
    success: boolean;
    error?: {
        code: ErrorCode;
        message: string;
    };
}

/**
 * Authentication class for handling Bearer token validation
 */
export class Auth {
    private bearerToken: string;

    constructor(private env: Env) {
        this.bearerToken = env.BEARER_TOKEN || '';
    }

    /**
     * Validate Bearer token from Authorization header
     * @param request - HTTP request object
     * @returns AuthResult - Authentication result
     */
    validateBearerToken(request: Request): AuthResult {
        // If no token is configured, allow all requests (development mode)
        if (!this.bearerToken) {
            console.warn('Warning: No BEARER_TOKEN configured, allowing all requests');
            return { success: true };
        }

        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return {
                success: false,
                error: {
                    code: ErrorCode.UNAUTHORIZED,
                    message: 'Missing Authorization header'
                }
            };
        }

        // Check if header starts with "Bearer "
        if (!authHeader.startsWith('Bearer ')) {
            return {
                success: false,
                error: {
                    code: ErrorCode.UNAUTHORIZED,
                    message: 'Invalid Authorization header format. Expected: Bearer <token>'
                }
            };
        }

        const token = authHeader.substring(7); // Remove "Bearer " prefix

        if (token !== this.bearerToken) {
            return {
                success: false,
                error: {
                    code: ErrorCode.UNAUTHORIZED,
                    message: 'Invalid or expired token'
                }
            };
        }

        return { success: true };
    }

    /**
     * Validate token from query parameter (for development/testing)
     * @param request - HTTP request object
     * @returns AuthResult - Authentication result
     */
    validateTokenFromQuery(request: Request): AuthResult {
        // If no token is configured, allow all requests
        if (!this.bearerToken) {
            return { success: true };
        }

        const url = new URL(request.url);
        const token = url.searchParams.get('token');

        if (!token) {
            return {
                success: false,
                error: {
                    code: ErrorCode.UNAUTHORIZED,
                    message: 'Missing token query parameter'
                }
            };
        }

        if (token !== this.bearerToken) {
            return {
                success: false,
                error: {
                    code: ErrorCode.UNAUTHORIZED,
                    message: 'Invalid or expired token'
                }
            };
        }

        return { success: true };
    }

    /**
     * Validate token from either header or query parameter
     * @param request - HTTP request object
     * @returns AuthResult - Authentication result
     */
    validateToken(request: Request): AuthResult {
        // Try Bearer token first
        const bearerResult = this.validateBearerToken(request);
        if (bearerResult.success) {
            return bearerResult;
        }

        // Fall back to query parameter (for development)
        return this.validateTokenFromQuery(request);
    }

    /**
     * Check if the request is from an allowed origin
     * @param request - HTTP request object
     * @returns boolean - True if origin is allowed
     */
    isOriginAllowed(request: Request): boolean {
        const origin = request.headers.get('Origin');

        // If no origin specified, allow (for same-origin requests)
        if (!origin) {
            return true;
        }

        const allowedOrigins = this.env.CORS_ORIGINS?.split(',') || ['*'];

        // Allow all origins if wildcard is specified
        if (allowedOrigins.includes('*')) {
            return true;
        }

        return allowedOrigins.includes(origin);
    }

    /**
     * Validate API key from custom header (alternative auth method)
     * @param request - HTTP request object
     * @returns AuthResult - Authentication result
     */
    validateApiKey(request: Request): AuthResult {
        // If no token is configured, allow all requests
        if (!this.bearerToken) {
            return { success: true };
        }

        const apiKey = request.headers.get('X-API-Key');

        if (!apiKey) {
            return {
                success: false,
                error: {
                    code: ErrorCode.UNAUTHORIZED,
                    message: 'Missing X-API-Key header'
                }
            };
        }

        if (apiKey !== this.bearerToken) {
            return {
                success: false,
                error: {
                    code: ErrorCode.UNAUTHORIZED,
                    message: 'Invalid API key'
                }
            };
        }

        return { success: true };
    }

    /**
     * Comprehensive request validation (auth + CORS)
     * @param request - HTTP request object
     * @returns AuthResult - Combined validation result
     */
    validateRequest(request: Request): AuthResult {
        // Check CORS origin
        if (!this.isOriginAllowed(request)) {
            return {
                success: false,
                error: {
                    code: ErrorCode.UNAUTHORIZED,
                    message: 'Origin not allowed'
                }
            };
        }

        // Try multiple auth methods
        const bearerResult = this.validateBearerToken(request);
        if (bearerResult.success) {
            return bearerResult;
        }

        const apiKeyResult = this.validateApiKey(request);
        if (apiKeyResult.success) {
            return apiKeyResult;
        }

        const queryResult = this.validateTokenFromQuery(request);
        if (queryResult.success) {
            return queryResult;
        }

        // All auth methods failed
        return {
            success: false,
            error: {
                code: ErrorCode.UNAUTHORIZED,
                message: 'Authentication required. Provide Bearer token, X-API-Key header, or token query parameter.'
            }
        };
    }

    /**
     * Generate a secure random token for development
     * @returns string - Generated token
     */
    static generateToken(): string {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
}

/**
 * Create authentication instance from environment
 * @param env - Cloudflare Worker environment
 * @returns Auth instance
 */
export function createAuth(env: Env): Auth {
    return new Auth(env);
}

/**
 * Middleware function to require authentication
 * @param request - HTTP request object
 * @param env - Cloudflare Worker environment
 * @returns Response | null - Returns error response if auth fails, null if successful
 */
export function requireAuth(request: Request, env: Env): Response | null {
    const auth = createAuth(env);
    const result = auth.validateRequest(request);

    if (!result.success) {
        return new Response(
            JSON.stringify({
                code: result.error?.code || ErrorCode.UNAUTHORIZED,
                msg: result.error?.message || 'Authentication failed'
            }),
            {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        );
    }

    return null;
}
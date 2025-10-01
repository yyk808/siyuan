/**
 * TypeScript type definitions for SiYuan Third-Party Inbox
 * Compatible with SiYuan Notes inbox API
 */

// Inbox item interface (matches SiYuan's IInbox)
export interface Shorthand {
    oId: string;                    // Unique ID (timestamp string)
    shorthandContent: string;       // HTML format content
    shorthandMd: string;           // Markdown format content
    shorthandDesc: string;         // Processed description
    shorthandFrom: number;         // Source identifier
    shorthandTitle: string;        // Item title
    shorthandURL: string;          // Original URL
    hCreated: string;             // Formatted creation time "2006-01-02 15:04"
}

// Database entity interface
export interface ShorthandEntity {
    id: string;                    // oId
    content_html: string;          // shorthandContent
    content_md: string;            // shorthandMd
    description: string;           // shorthandDesc
    from_source: number;           // shorthandFrom
    title: string;                 // shorthandTitle
    url: string;                   // shorthandURL
    created_at: number;            // Creation timestamp (milliseconds)
}

// API request/response interfaces
export interface ApiResponse<T = any> {
    code: number;                  // 0 for success, non-zero for error
    msg: string;                   // Success or error message
    data?: T;                      // Response data
}

export interface PaginationInfo {
    paginationPageCount: number;   // Total pages
    paginationRecordCount: number; // Total records
}

export interface ShorthandsResponse {
    shorthands: Shorthand[];
    pagination: PaginationInfo;
}

// API request interfaces
export interface GetShorthandsRequest {
    page: number;                  // Page number (1-based)
    limit?: number;                // Items per page (default: 20)
}

export interface CreateShorthandRequest {
    content_md: string;            // Markdown content
    title: string;                 // Item title
    url?: string;                  // Original URL (optional)
    from_source?: number;          // Source identifier (optional)
}

export interface DeleteShorthandsRequest {
    ids: string[];                 // Array of IDs to delete
}

// Cloudflare Worker environment
export interface Env {
    DB: D1Database;               // D1 database binding
    BEARER_TOKEN?: string;         // Authentication token (secret)
    CORS_ORIGINS?: string;         // CORS origins (comma separated)
}

// Error codes
export enum ErrorCode {
    SUCCESS = 0,
    INVALID_REQUEST = 1,
    UNAUTHORIZED = 2,
    NOT_FOUND = 3,
    INTERNAL_ERROR = 4,
    VALIDATION_ERROR = 5,
    DATABASE_ERROR = 6
}

// Error messages
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
    [ErrorCode.SUCCESS]: "success",
    [ErrorCode.INVALID_REQUEST]: "Invalid request",
    [ErrorCode.UNAUTHORIZED]: "Unauthorized",
    [ErrorCode.NOT_FOUND]: "Resource not found",
    [ErrorCode.INTERNAL_ERROR]: "Internal server error",
    [ErrorCode.VALIDATION_ERROR]: "Validation error",
    [ErrorCode.DATABASE_ERROR]: "Database operation failed"
};

// Utility type for database results
export type D1Result<T> = D1ResultObject<T> & {
    success: boolean;
}

export type D1ResultObject<T> = {
    results: T[];
    duration: number;
    lastRowId?: number;
    changes?: number;
}
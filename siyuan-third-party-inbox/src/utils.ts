/**
 * Utility functions for SiYuan Third-Party Inbox
 */

import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Shorthand, ShorthandEntity } from './types';

/**
 * Generates a unique ID based on current timestamp
 * @returns string - Unique ID (timestamp string)
 */
export function generateId(): string {
    return Date.now().toString();
}

/**
 * Converts Markdown to HTML with sanitization
 * @param markdown - Markdown content
 * @returns string - Sanitized HTML content
 */
export function markdownToHtml(markdown: string): string {
    const html = marked(markdown);
    // Note: DOMPurify in Cloudflare Workers might need special configuration
    // For now, we'll use basic sanitization
    return sanitizeHtml(html);
}

/**
 * Basic HTML sanitization (simplified version for Cloudflare Workers)
 * @param html - HTML content to sanitize
 * @returns string - Sanitized HTML content
 */
export function sanitizeHtml(html: string): string {
    // Basic HTML sanitization - remove script tags and dangerous attributes
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

/**
 * Generates a description from content
 * @param content - HTML content
 * @param maxLength - Maximum length of description
 * @returns string - Generated description
 */
export function generateDescription(content: string, maxLength: number = 200): string {
    // Remove HTML tags and normalize whitespace
    const textContent = content
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Replace media placeholders
    const processedText = textContent
        .replace(/<audio.*>.*<\/audio>/gi, ' [audio] ')
        .replace(/<video.*>.*<\/video>/gi, ' [video] ')
        .replace(/\[file]\(.*\)/gi, ' [file] ')
        .replace(/\n\n/g, ' ');

    // Truncate to max length
    if (processedText.length <= maxLength) {
        return processedText;
    }

    return processedText.substring(0, maxLength).trim() + '...';
}

/**
 * Formats timestamp to SiYuan format
 * @param timestamp - Timestamp in milliseconds
 * @returns string - Formatted time string "2006-01-02 15:04"
 */
export function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Converts database entity to API response format
 * @param entity - Database entity
 * @returns Shorthand - API response object
 */
export function entityToShorthand(entity: ShorthandEntity): Shorthand {
    return {
        oId: entity.id,
        shorthandContent: entity.content_html,
        shorthandMd: entity.content_md,
        shorthandDesc: entity.description,
        shorthandFrom: entity.from_source,
        shorthandTitle: entity.title,
        shorthandURL: entity.url,
        hCreated: formatTimestamp(entity.created_at)
    };
}

/**
 * Validates if a string is a valid URL
 * @param url - URL string to validate
 * @returns boolean - True if valid URL
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validates required fields for create shorthand request
 * @param data - Request data
 * @returns string | null - Error message or null if valid
 */
export function validateCreateShorthandRequest(data: any): string | null {
    if (!data.content_md || typeof data.content_md !== 'string') {
        return 'content_md is required and must be a string';
    }

    if (!data.title || typeof data.title !== 'string') {
        return 'title is required and must be a string';
    }

    if (data.url && !isValidUrl(data.url)) {
        return 'url must be a valid URL';
    }

    if (data.from_source !== undefined && typeof data.from_source !== 'number') {
        return 'from_source must be a number';
    }

    return null;
}

/**
 * Validates pagination parameters
 * @param page - Page number
 * @param limit - Items per page
 * @returns string | null - Error message or null if valid
 */
export function validatePaginationParams(page: any, limit: any): string | null {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit) || 20;

    if (isNaN(pageNum) || pageNum < 1) {
        return 'page must be a positive integer';
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return 'limit must be between 1 and 100';
    }

    return null;
}

/**
 * Sets CORS headers for the response
 * @param headers - Headers object to modify
 * @param origin - Allowed origin (from environment variable)
 */
export function setCorsHeaders(headers: Headers, origin?: string): void {
    const allowedOrigins = origin ? origin.split(',') : ['*'];
    const requestOrigin = headers.get('Origin');

    if (allowedOrigins.includes('*') || (requestOrigin && allowedOrigins.includes(requestOrigin))) {
        headers.set('Access-Control-Allow-Origin', requestOrigin || '*');
    }

    headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.set('Access-Control-Max-Age', '86400');
}
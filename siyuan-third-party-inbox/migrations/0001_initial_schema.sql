-- Migration: Initial schema for SiYuan Third-Party Inbox
-- This migration creates the necessary tables and indexes

-- Create shorthands table
CREATE TABLE IF NOT EXISTS shorthands (
    id TEXT PRIMARY KEY,                    -- oId: Unique identifier (timestamp string)
    content_html TEXT NOT NULL,             -- shorthandContent: HTML format content
    content_md TEXT NOT NULL,               -- shorthandMd: Markdown format content
    description TEXT NOT NULL,              -- shorthandDesc: Processed content description
    from_source INTEGER DEFAULT 0,         -- shorthandFrom: Source identifier
    title TEXT NOT NULL,                    -- shorthandTitle: Item title
    url TEXT NOT NULL,                      -- shorthandURL: Original URL
    created_at INTEGER NOT NULL             -- Creation timestamp (milliseconds)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_created_at_desc ON shorthands (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_id ON shorthands (id);
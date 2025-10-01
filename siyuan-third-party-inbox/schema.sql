-- SiYuan Third-Party Inbox Database Schema
-- Compatible with SiYuan Notes inbox API

-- Main shorthands table
CREATE TABLE IF NOT EXISTS shorthands (
    id TEXT PRIMARY KEY,                    -- oId: Unique identifier (timestamp string)
    content_html TEXT NOT NULL,             -- shorthandContent: HTML format content
    content_md TEXT NOT NULL,               -- shorthandMd: Markdown format content
    description TEXT NOT NULL,              -- shorthandDesc: Processed content description
    from_source INTEGER DEFAULT 0,         -- shorthandFrom: Source identifier
    title TEXT NOT NULL,                    -- shorthandTitle: Item title
    url TEXT NOT NULL,                      -- shorthandURL: Original URL
    created_at INTEGER NOT NULL,            -- Creation timestamp (milliseconds)

    -- Indexes for performance
    INDEX idx_created_at_desc (created_at DESC),
    INDEX idx_id (id)
);

-- Sample data for testing (optional)
-- INSERT INTO shorthands (
--     id,
--     content_html,
--     content_md,
--     description,
--     from_source,
--     title,
--     url,
--     created_at
-- ) VALUES (
--     '1696156800000',
--     '<p>This is a <strong>sample</strong> inbox item.</p>',
--     'This is a **sample** inbox item.',
--     'This is a sample inbox item.',
--     0,
--     'Sample Item',
--     'https://example.com/sample',
--     1696156800000
-- );
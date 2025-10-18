-- Migration: Add video fields for package opening videos and returns
-- Date: 2025-01-18
-- Description: Adds video upload support for orders and returns with multi-item return reasons

-- Add video fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS package_video_url TEXT,
ADD COLUMN IF NOT EXISTS package_video_type VARCHAR(10) CHECK (package_video_type IN ('file', 'link')),
ADD COLUMN IF NOT EXISTS video_uploaded_at TIMESTAMP;

-- Add video fields to returns table
ALTER TABLE returns
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_type VARCHAR(10) CHECK (video_type IN ('file', 'link')),
ADD COLUMN IF NOT EXISTS video_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS video_waived_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS video_waived_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS video_waiver_reason TEXT;

-- Add individual return reason fields to return_items table
ALTER TABLE return_items
ADD COLUMN IF NOT EXISTS return_reason VARCHAR(100),
ADD COLUMN IF NOT EXISTS return_description TEXT;

-- Create index for faster video queries
CREATE INDEX IF NOT EXISTS idx_orders_video_url ON orders(package_video_url) WHERE package_video_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_returns_video_url ON returns(video_url) WHERE video_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_returns_video_waived ON returns(video_waived_by) WHERE video_waived_by IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN orders.package_video_url IS 'URL to package opening video (Cloudinary URL or external link)';
COMMENT ON COLUMN orders.package_video_type IS 'Type of video: file (uploaded) or link (external URL)';
COMMENT ON COLUMN orders.video_uploaded_at IS 'Timestamp when video was uploaded';

COMMENT ON COLUMN returns.video_url IS 'URL to package opening video for return request';
COMMENT ON COLUMN returns.video_type IS 'Type of video: file (uploaded) or link (external URL)';
COMMENT ON COLUMN returns.video_required IS 'Whether video is required for this return';
COMMENT ON COLUMN returns.video_waived_by IS 'Admin user who waived video requirement';
COMMENT ON COLUMN returns.video_waived_at IS 'Timestamp when video requirement was waived';
COMMENT ON COLUMN returns.video_waiver_reason IS 'Reason for waiving video requirement';

COMMENT ON COLUMN return_items.return_reason IS 'Reason for returning this specific item';
COMMENT ON COLUMN return_items.return_description IS 'Detailed description for returning this item';


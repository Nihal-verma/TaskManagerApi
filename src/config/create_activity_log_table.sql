CREATE TABLE activity_logs (
    id UUID PRIMARY KEY,
    userId UUID,
    activityType VARCHAR(255),
    "timestamp" TIMESTAMP,
    details TEXT
);
CREATE TABLE comments (
    id UUID PRIMARY KEY,
    taskId UUID,
    userId UUID,
    content TEXT,
    timestamp TIMESTAMP
);
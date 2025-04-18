CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    userId UUID,
    message TEXT,
    type VARCHAR(255),
    taskId UUID,
    isRead BOOLEAN,
    timestamp TIMESTAMP
);
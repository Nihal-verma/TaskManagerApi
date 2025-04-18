CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,
    dueDate DATE,
    priority VARCHAR(50),
    estimatedTime INTEGER,
    attachmentPath VARCHAR(255)
);
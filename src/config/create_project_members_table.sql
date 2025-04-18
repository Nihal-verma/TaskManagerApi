CREATE TABLE project_members (
    id UUID PRIMARY KEY,
    projectId UUID,
    userId UUID,
    role VARCHAR(255)
);
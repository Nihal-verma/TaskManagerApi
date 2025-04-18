export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'admin' | 'editor' | 'viewer';
}
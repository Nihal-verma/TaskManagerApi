export interface ActivityLog {
  id: string;
  userId: string;
  activityType: string;
  timestamp: Date;
  details: string | null;
}
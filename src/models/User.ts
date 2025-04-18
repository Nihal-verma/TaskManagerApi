export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  refreshToken: string | null;
  avatar?: string | null;
  resetToken?: string | null;
  resetTokenExpires?: Date | null;
}
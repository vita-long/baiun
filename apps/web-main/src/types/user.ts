export interface User {
  id: number;
  userId: string;
  username: string;
  email: string;
  phone: string;
  avatar?: string;
  bio?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
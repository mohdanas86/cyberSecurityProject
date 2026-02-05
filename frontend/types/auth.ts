export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginData {
  username?: string;
  email?: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  avatar: File;
  coverImage?: File;
}


export interface User {
  id: string; // uuid
  email: string;
  name?: string;
  avatar?: string;
}

export interface Session {
  key: string; // uuid
  expires: number;
}
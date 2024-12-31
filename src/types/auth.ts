
export interface User {
  id: string; // uuid
  email: string;
}

export interface Session {
  key: string; // uuid
  expires: number;
}
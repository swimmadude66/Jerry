
export interface User {
  id: string // uuid
  email: string
  isAdmin: boolean
  name?: string
  avatar?: string
}

export interface Session {
  key: string // uuid
  expires: number
}

export interface UserRow {
  id: string
  email: string
  user_name?: string
  avatar_url?: string
  is_admin: boolean
}
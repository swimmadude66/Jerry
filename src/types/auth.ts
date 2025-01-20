
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
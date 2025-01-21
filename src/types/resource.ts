import { User } from './auth'

export interface ResourceInfo {
  id: string
  name: string
  description?: string
  expires?: Date
  claimant?: User
}
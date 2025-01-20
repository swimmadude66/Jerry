import { GlobalKey } from '@tectonica/manager'

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export type AuthEvents = {
  userChanged: (key: typeof GlobalKey, user?: User) => void
}
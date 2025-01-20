import { AbstractManager } from '@tectonica/manager';
import type { User, AuthEvents } from './types';


export class AuthManager extends AbstractManager<AuthEvents> {

  private _user?: User;

  get user(): User | undefined {
    return this._user
  }

  set user(u: User | undefined) {
    this._user = u;
    this.emitGlobal('userChanged', u)
  }

  constructor() {
    super({name: 'AuthManager'})
  }

  init(): void {
    void this._inspectSession()
  }

  private async _inspectSession(): Promise<User | undefined> {
    try {
      const res = await fetch('/api/auth', {method: 'GET'})
      const {user} = await res.json()
      if (user) {
        this.user = user
        return user
      }
    } catch (e) {
      console.error('Error validating session:', e)
      return undefined
    }
  }

  async logOut(): Promise<void> {
    void fetch('/api/auth', {method: 'DELETE'})
    this.user = undefined
  }

}
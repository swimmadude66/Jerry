'use client'
import { createGlobalValueListenerHook, createManagerHook, createProvider } from '@tectonica/manager'
import { AuthManager } from './manager'
import { useEffect, useMemo } from 'react'

export const AuthManagerProvider = createProvider(AuthManager, () => {
  const service = useMemo(() => {
   return new AuthManager()
  }, []) 
 
  useEffect(() => {
   service?.init()
 
   return () => {
     service?.teardown()
   }
  }, [service])
 
  return service
 })
 
 export const useAuthManager = createManagerHook(AuthManager)

 export const useAuthUser = createGlobalValueListenerHook(AuthManager, 'userChanged', ({ manager }: {manager?: AuthManager}) => manager?.user, () => undefined)
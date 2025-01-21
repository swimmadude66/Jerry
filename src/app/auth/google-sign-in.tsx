
'use client'
import React, { useCallback, useEffect, useRef } from 'react'
import { redirect, RedirectType } from 'next/navigation'
import { useAuthManager } from '@jerry/managers/auth/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let google: any;

export function GoogleSignIn({onAuthError}: {onAuthError?: (error: string) => void}) {

  const authManager = useAuthManager()

  const btnRef = useRef<HTMLDivElement | null>(null)

  const handleGoogleAuth = useCallback((googleResponse: {credential?: string; clientId?: string} = {}) => {
    async function validateGoogleResponse(response: {credential: string; clientId: string}) {
      const authRes = await fetch('/api/auth/google', {method: 'POST', body: JSON.stringify(response)})
      if (authRes.status !== 200) {
        onAuthError?.('Could not authenticate with Google')
        return;
      }
      const {user} = await authRes.json()
      if (!user) {
        onAuthError?.('Could not authenticate with Google')
        return
      }
      authManager.user = user
      redirect('/', RedirectType.push)
    }
    
    onAuthError?.('')
    const {clientId, credential} = googleResponse ?? {}

    if (!clientId || !credential) {
      onAuthError?.('Could not authenticate with Google')
      return;
    }
    void validateGoogleResponse({clientId, credential})

  }, [authManager, onAuthError])

  useEffect(() => {
    google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
      callback: handleGoogleAuth
    });
    google.accounts.id.renderButton(
      btnRef.current,
      { theme: "filled_black", size: "large", text: "continue_with", shape: "rectangular", type: "standard", width: 240, height: 40 }  // customization attributes
    );
  }, [handleGoogleAuth])

  return (
    <div id="google-signin-btn-container" ref={btnRef} style={{width: '15rem', height: '2.5rem', overflow: 'hidden', borderRadius: '4px'}} />
  )
}
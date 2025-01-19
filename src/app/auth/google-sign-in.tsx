
'use client'
import React, { useCallback, useEffect } from 'react'
import { redirect, RedirectType } from 'next/navigation'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let google: any;

export function GoogleSignIn() {

  const handleGoogleAuth = useCallback((googleResponse: {credential?: string; clientId?: string} = {}) => {
    async function validateJWT(response: {credential: string; clientId: string}) {
      const authRes = await fetch('/api/auth/google', {method: 'POST', body: JSON.stringify(response)})
      if (authRes.status !== 200) {
        // show error
        return;
      }
      const result = await authRes.json()
      // todo: update user service
      redirect('/', RedirectType.push)

    }
    const {clientId, credential} = googleResponse ?? {}

    if (!clientId || !credential) {
      // show login error
      return;
    }
    void validateJWT({clientId, credential})

  }, [])

  useEffect(() => {
    google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
      callback: handleGoogleAuth
    });
    google.accounts.id.renderButton(
      document.getElementById("buttonDiv"),
      { theme: "outline", size: "large" }  // customization attributes
    );
  }, [handleGoogleAuth])

  return (
    <>
      <script src="https://accounts.google.com/gsi/client" async></script>
      <div id="buttonDiv" />
    </>
  )
}
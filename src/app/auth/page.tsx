'use client'
import React, { useState } from 'react'
import { GoogleSignIn } from './google-sign-in'

export default function Login() {

  const [authError, setAuthError] = useState('')

  return (
  <div style={{display: 'flex', justifyContent: 'center', padding: '2.4rem'}}>
    <div style={{flex: 1, flexDirection:'column', minWidth: '32rem', maxWidth: '36rem', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '2rem', gap: '0.8rem', textAlign: 'center', border: '1px inset #AAA'}}>
      <h2>Log in or Sign up</h2>
      <GoogleSignIn onAuthError={setAuthError}/>
      <span color="red">{authError}</span>
    </div>
  </div>
  )
}
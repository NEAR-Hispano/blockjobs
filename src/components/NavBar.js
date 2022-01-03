import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout } from './utils'

export default function NavBar() {
    if (!window.walletConnection.isSignedIn()) {
        return (
          <main>
            <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
              <button onClick={login}>Sign in</button>
            </p>
          </main>
        )
      }
    
      return (
        <>
          <button className="link" style={{ float: 'right' }} onClick={logout}>
            Sign out
          </button>
        </>
      )
}
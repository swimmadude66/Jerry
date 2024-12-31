import React from 'react'

export default function Login() {

  return <div>
      <div id="g_id_onload"
        data-client_id={`${process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID}`}
        data-context="signin"
        data-ux_mode="popup"
        data-login_uri="/api/auth/google"
        data-nonce=""
        data-auto_select="true"
        data-itp_support="true">
    </div>

    <div className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="filled_black"
        data-text="continue_with"
        data-size="large"
        data-logo_alignment="left">
    </div>
  </div>
}
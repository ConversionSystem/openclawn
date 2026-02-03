import * as jose from 'jose'

export interface GoogleUserInfo {
  sub: string // Google user ID
  email: string
  name?: string
  picture?: string
  email_verified: boolean
}

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.API_URL}/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    state,
    prompt: 'consent',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string
  id_token: string
  refresh_token?: string
}> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.API_URL}/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code: ${error}`)
  }

  return response.json()
}

/**
 * Verify and decode Google ID token
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleUserInfo> {
  // Fetch Google's public keys
  const JWKS = jose.createRemoteJWKSet(
    new URL('https://www.googleapis.com/oauth2/v3/certs')
  )

  // Verify the token
  const { payload } = await jose.jwtVerify(idToken, JWKS, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: process.env.GOOGLE_CLIENT_ID!,
  })

  return {
    sub: payload.sub!,
    email: payload.email as string,
    name: payload.name as string | undefined,
    picture: payload.picture as string | undefined,
    email_verified: payload.email_verified as boolean,
  }
}

/**
 * Get user info from Google using access token
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get user info from Google')
  }

  return response.json()
}

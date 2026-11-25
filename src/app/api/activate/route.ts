import { NextRequest, NextResponse } from 'next/server';

/**
 * Direct API endpoint for Faculty Activation: /api/activate
 * Redirects browser to /activate page with query parameters preserved (token, user).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || '';
  const user = searchParams.get('user') || '';

  const targetUrl = new URL('/activate', request.url);
  if (token) targetUrl.searchParams.set('token', token);
  if (user) targetUrl.searchParams.set('user', user);

  return NextResponse.redirect(targetUrl, 307);
}

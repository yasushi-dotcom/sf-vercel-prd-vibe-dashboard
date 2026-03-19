const ALLOWED_RANGES = [
  { start: ip2int('126.206.87.0'), end: ip2int('126.206.87.255') },  // Home
  { start: ip2int('124.36.99.0'),  end: ip2int('124.36.99.255') },   // Office
]

function ip2int(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0
}

function isAllowed(ip) {
  const ipInt = ip2int(ip)
  return ALLOWED_RANGES.some(range => ipInt >= range.start && ipInt <= range.end)
}

export default function middleware(request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0'

  // Allow API routes through
  const url = new URL(request.url)
  if (url.pathname.startsWith('/api/')) {
    return new Response(null, { status: 200 })
  }

  if (!isAllowed(ip)) {
    return new Response('403 Access Denied', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  return new Response(null, { status: 200 })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

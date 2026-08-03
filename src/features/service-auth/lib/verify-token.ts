import crypto from 'crypto'
import { NextRequest } from 'next/server'

interface SignatureInput {
  timestamp: string
  method: string
  pathname: string
  body: string
}

interface SignatureVerificationInput extends SignatureInput {
  signature: string
  nowSeconds?: number
}

function signaturePayload({ timestamp, method, pathname, body }: SignatureInput): string {
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex')
  return `${timestamp}\n${method.toUpperCase()}\n${pathname}\n${bodyHash}`
}

function safeEqualHex(expected: string, actual: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(actual)) {
    return false
  }
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(actual, 'hex'))
}

export function verifyToken(token: string): boolean {
  const serviceToken = process.env.ALAS_SERVICE_TOKEN
  if (!serviceToken) {
    return false
  }

  const keyHash = crypto.createHash('sha256').update(serviceToken).digest()
  const inputHash = crypto.createHash('sha256').update(token).digest()

  return crypto.timingSafeEqual(keyHash, inputHash)
}

export function authenticateService(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }
  const token = authHeader.substring(7)
  return verifyToken(token)
}

export function createServiceSignature(input: SignatureInput): string {
  const secret = process.env.ALAS_WEBHOOK_SECRET
  if (!secret) {
    return ''
  }
  return crypto.createHmac('sha256', secret).update(signaturePayload(input)).digest('hex')
}

export function verifyServiceSignature({
  signature,
  nowSeconds = Math.floor(Date.now() / 1000),
  ...input
}: SignatureVerificationInput): boolean {
  const replayWindow = Number.parseInt(process.env.ALAS_REPLAY_WINDOW_SECONDS || '', 10)
  const requestSeconds = Number.parseInt(input.timestamp, 10)
  if (!Number.isInteger(replayWindow) || replayWindow <= 0 || !Number.isInteger(requestSeconds)) {
    return false
  }
  if (Math.abs(nowSeconds - requestSeconds) > replayWindow) {
    return false
  }

  const expected = createServiceSignature(input)
  return expected.length === 64 && safeEqualHex(expected, signature)
}

export function authenticateServiceWrite(request: NextRequest, body: string): boolean {
  if (!authenticateService(request)) {
    return false
  }
  const timestamp = request.headers.get('X-ALAS-Timestamp') || ''
  const signature = request.headers.get('X-ALAS-Signature') || ''
  return verifyServiceSignature({
    timestamp,
    signature,
    method: request.method,
    pathname: request.nextUrl.pathname,
    body,
  })
}

export function getServiceEventId(request: NextRequest): string | null {
  const eventId = request.headers.get('X-ALAS-Event-Id') || ''
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId)
    ? eventId
    : null
}

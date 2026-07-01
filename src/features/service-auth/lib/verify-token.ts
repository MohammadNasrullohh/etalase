import crypto from 'crypto'
import { NextRequest } from 'next/server'

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

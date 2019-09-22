import jwt from 'jsonwebtoken'

export function verifyToken(tokenRaw: string) {
    return jwt.verify(tokenRaw, 'secret') as IJWTToken
}

export function createToken(token: IJWTToken) {
    return jwt.sign(token, 'secret', { expiresIn: '7d' }) as string
}

interface IJWTToken {
    id: number
    uid: number
}

import jwt from 'jsonwebtoken'

import { IAccessToken } from './_/AccessToken'

interface IJWTAccessTokenConfig {
    SECRET: string
}

export class JWTAccessToken {
    constructor(private CONFIG: IJWTAccessTokenConfig) { }

    public async verify(rawToken: string) {
        const decodedToken = await new Promise<IJWTAccessToken>((resolve, reject) => {
            jwt.verify(rawToken, this.CONFIG.SECRET, ((err, decoded) => {
                if (err) {
                    reject(err)
                }
                resolve(decoded)
            }))
        })

        if (decodedToken.tkn !== 'accessToken') {
            throw new Error('invalid accessToken')
        }

        return decodedToken
    }

    public async create(accessToken: ReturnType<IAccessToken['build']>) {
        return new Promise<string>((resolve, reject) => {
            jwt.sign({
                jti: accessToken.id,
                uid: accessToken.userId,
                exp: dateToUnix(accessToken.expiresAt),
                iat: dateToUnix(accessToken.createdAt),
                tkn: 'accessToken',
            }, this.CONFIG.SECRET, ((err, rawToken) => {
                if (err) {
                    reject(err)
                }
                resolve(rawToken)
            }))
        })
    }
}

interface IJWTAccessToken {
    jti: string
    uid: string
    exp: number
    iat: number
    tkn: 'accessToken'
}

function dateToUnix(date: Date) {
    return parseInt((date.getTime() / 1000).toFixed(0), 10)
}

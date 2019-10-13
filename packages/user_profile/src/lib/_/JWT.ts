import jwt from 'jsonwebtoken'

interface ITokenConfig {
    SECRET: string
    EXPIRES: string
}

export class JWT {
    constructor(private CONFIG: ITokenConfig) { }

    public verifyToken(tokenRaw: string) {
        return jwt.verify(tokenRaw, this.CONFIG.SECRET) as IJWTToken
    }

    public createToken(token: IJWTToken) {
        return jwt.sign(token, this.CONFIG.SECRET, { expiresIn: this.CONFIG.EXPIRES }) as string
    }
}

interface IJWTToken {
    id: string
    uid: string
}

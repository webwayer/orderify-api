import { IAccessToken } from './_/AccessToken'
import { JWT } from './JWT'

export class Auth {
    constructor(
        private AccessToken: IAccessToken,
        private jwt: JWT,
    ) { }

    public async auth(userId: string) {
        const accessToken = await this.AccessToken.create({
            userId,
        })

        const token = this.jwt.createToken({
            id: accessToken.id,
            uid: userId,
        })

        return token
    }

    public async verify(token: string) {
        const decodedToken = this.jwt.verifyToken(token)

        return this.AccessToken.findByPk(decodedToken.id)
    }
}

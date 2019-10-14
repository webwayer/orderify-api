import { IAccessToken } from './_/AccessToken'
import { IUser } from './_/User'
import { JWT } from './JWT'

export class Auth {
    constructor(
        private User: IUser,
        private AccessToken: IAccessToken,
        private jwt: JWT,
    ) { }

    public async signIn(userId: string) {
        const accessToken = await this.AccessToken.create({
            userId,
        })

        return this.jwt.createToken({
            id: accessToken.id,
            uid: userId,
        })
    }

    public async verify(token: string) {
        const decodedToken = this.jwt.verifyToken(token)

        return this.AccessToken.findByPk(decodedToken.id)
    }

    public async signUp(user: Parameters<IUser['create']>[0]) {
        return this.User.create(user)
    }

    public async findByEmail(email: string) {
        return this.User.findOne({ where: { email } })
    }
}

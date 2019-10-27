import { IAccessToken } from './_/AccessToken'

interface IAuthConfig {
    EXPIRES_IN_SECONDS: string
}

export class Auth {
    constructor(
        private CONFIG: IAuthConfig,
        private AccessToken: IAccessToken,
    ) { }

    public async logIn(userId: string) {
        return await this.AccessToken.create({
            userId,
            expiresAt: addSecondsToDate(new Date(), this.CONFIG.EXPIRES_IN_SECONDS),
        })
    }

    public async logOut(id: string) {
        await this.AccessToken.destroyById(id)
    }

    public async verify(id: string) {
        const accessToken = await this.AccessToken.findByPk(id)

        if (!accessToken) {
            throw new Error('token not found')
        }

        if (accessToken.expiresAt < new Date()) {
            throw new Error('token expired')
        }

        return accessToken.userId
    }
}

function addSecondsToDate(date: Date, seconds: string) {
    return secondsToDate(dateToSeconds(date) + stringToSeconds(seconds))
}

function stringToSeconds(seconds: string) {
    return parseInt(seconds, 10)
}

function dateToSeconds(date: Date) {
    return Math.floor(date.getTime() / 1000)
}

function secondsToDate(seconds: number) {
    return new Date(seconds * 1000)
}

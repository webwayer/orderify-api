import crypto from 'crypto'

import { IPKCECode } from './_/PKCECode'

interface IPKCEConfig {
    EXPIRES_IN_SECONDS: string
}

export class PKCE {
    constructor(
        private CONFIG: IPKCEConfig,
        private PKCECode: IPKCECode,
    ) { }

    public async start(state: string, code_challenge: string) {
        const pkceCode = await this.PKCECode.create({
            state,
            code_challenge,
            expiresAt: addSecondsToDate(new Date(), this.CONFIG.EXPIRES_IN_SECONDS),
        })

        return pkceCode.id
    }

    public async verify(code: string, code_verifier: string) {
        const pkceCode = await this.PKCECode.findByPk(code)

        if (!pkceCode) {
            throw new Error('code not found')
        }

        await this.PKCECode.destroyById(pkceCode.id)

        if (pkceCode.expiresAt < addSecondsToDate(new Date(), this.CONFIG.EXPIRES_IN_SECONDS)) {
            throw new Error('code expired')
        }

        if (pkceCode.code_challenge !== sha256(code_verifier)) {
            throw new Error('invalid code verifier')
        }

        return pkceCode.state
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

function sha256(str: string) {
    return crypto.createHash('sha256').update(str).digest('hex')
}

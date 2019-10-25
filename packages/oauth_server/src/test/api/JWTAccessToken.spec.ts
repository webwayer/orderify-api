import assert from 'assert'

import { sequelize, jwtAccessToken, auth, AccessToken } from '../service'

const thirdPartyJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiYW55dGhpbmciLCJpYXQiOjE1NzE1NjU1MzR9.CAXud3Ee9XVTkNaeP5_P7Geg2DeyXzfAVIdYjIPMAUQ'
const tkn_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiYW55dGhpbmciLCJ0a24iOiJ0b2tlbiIsImlhdCI6MTU3MTU2NTcxM30.mb0M9QZLZM5PcRLeIrPWaQBZSDzWSRqRykI-CR9rM1s'

describe('JWTAccessToken', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
    })
    describe('create - verify', () => {
        it('success', async () => {
            const accessToken = await auth.logIn('user1')

            assert(accessToken.id)

            const rawToken = await jwtAccessToken.create(accessToken)

            assert(rawToken)

            const decodedToken = await jwtAccessToken.verify(rawToken)

            assert.equal(decodedToken.jti, accessToken.id)
            assert.equal(decodedToken.uid, 'user1')
        })
    })

    describe('verify', () => {
        it('fail - not jwt', async () => {
            await assert.rejects(jwtAccessToken.verify('xyz'))
        })

        it('fail - invalid signature', async () => {
            await assert.rejects(jwtAccessToken.verify(thirdPartyJWT))
        })

        it('fail - invalid `tkn` field', async () => {
            await assert.rejects(jwtAccessToken.verify(tkn_token))
        })

        it('fail - expired', async () => {
            const accessToken = await AccessToken.create({
                userId: 'user1',
                expiresAt: new Date(new Date().getTime() - 2000),
            })

            const rawToken = await jwtAccessToken.create(accessToken)

            assert(rawToken)

            await assert.rejects(jwtAccessToken.verify(rawToken))
        })
    })
})

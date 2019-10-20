import assert from 'assert'

import { sequelize, auth, AccessToken } from '../service'

describe('Auth', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
    })

    describe('login - verify - logout - verify', () => {
        it('success', async () => {
            const accessToken = await auth.logIn('user1')

            assert(accessToken.id)

            const userId = await auth.verify(accessToken.id)

            assert.equal(userId, 'user1')

            await auth.logOut(accessToken.id)

            await assert.rejects(auth.verify(accessToken.id))
        })
    })

    describe('verify', () => {
        it('fail - invalid token', async () => {
            await assert.rejects(auth.verify('xyz'))
        })

        it('fail - expired', async () => {
            const accessToken = await AccessToken.create({
                userId: 'user1',
                expiresAt: new Date(new Date().getTime() - 2000)
            })

            await assert.rejects(auth.verify(accessToken.id))
        })
    })
})
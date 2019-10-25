import assert from 'assert'

import { sequelize, pkce, PKCECode } from '../service'

// sha256 from `code_verifier_string`
const code_challenge = 'b1794757a33814aabb551136200573b1aa29bd5f67e7ef8324cbb6850c082cec'
const code_verifier = 'code_verifier_string'

describe('PKCE', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
    })
    describe('start - verify - verify', () => {
        it('success', async () => {
            const pkceCode = await pkce.start('user1', code_challenge)

            assert(pkceCode)

            const state = await pkce.verify(pkceCode, code_verifier)

            assert.equal(state, 'user1')

            await assert.rejects(pkce.verify(pkceCode, code_verifier))
        })
    })

    describe('verify', () => {
        it('fail - invalid code', async () => {
            await assert.rejects(pkce.verify('xyz', code_verifier))
        })

        it('fail - invalid code verifier', async () => {
            const pkceCode = await pkce.start('user1', code_challenge)

            await assert.rejects(pkce.verify(pkceCode, 'xyz'))
        })

        it('fail - expired', async () => {
            const pkceCode = await PKCECode.create({
                state: 'user1',
                code_challenge,
                expiresAt: new Date(new Date().getTime() - 2000),
            })

            await assert.rejects(pkce.verify(pkceCode.id, code_verifier))
        })
    })
})

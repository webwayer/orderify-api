import assert from 'assert'

import { sequelize, userProfile } from '../service'

describe('api', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
    })

    describe('findByEmail', () => {
        it('success', async () => {
            await userProfile.create({
                id: 'user1',
                name: 'name',
                email: 'test@example.com',
            })

            const user = await userProfile.findByEmail('test@example.com')
            assert.equal(user.id, 'user1')
        })
    })

    describe('findById', () => {
        it('success', async () => {
            await userProfile.create({
                id: 'user1',
                name: 'name',
                email: 'test@example.com',
            })

            const user = await userProfile.findById('user1')
            assert.equal(user.email, 'test@example.com')
        })
    })
})

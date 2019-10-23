import assert from 'assert'

import { graphql } from 'graphql'
import { graphqlQuery } from '@orderify/io'

import { sequelize, User, schema } from '../service'

describe('me', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
    })

    it('success', async () => {
        await User.create({
            id: 'user1',
            name: 'name',
            email: 'test@example.com',
        })

        const result = await graphql({
            schema,
            source: graphqlQuery({
                name: 'me',
                fields: ['id', 'name', 'email'],
            }),
            contextValue: {
                userId: 'user1',
            },
        })

        assert.equal(result.data.me.id, 'user1')
        assert.equal(result.data.me.name, 'name')
        assert.equal(result.data.me.email, 'test@example.com')
    })
})

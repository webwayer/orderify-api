import assert from 'assert'
import { walletOperationsServiceFactory } from '../service'
import { DEFAULT_CONFIG, updateConfig, graphqlSchemaFactory, query } from '@orderify/app'
import { SequelizeFactory } from '@orderify/io'
import { graphql } from 'graphql'

const sequelize = SequelizeFactory(updateConfig(DEFAULT_CONFIG, process.env).DATABASE)
const {
    Wallet,
    walletOperationsGraphql,
} = walletOperationsServiceFactory(sequelize)
const schema = graphqlSchemaFactory({
    query: walletOperationsGraphql.query,
})

describe('Wallet Operations', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
    })

    describe('walletBalance', () => {
        it('success', async () => {
            await Wallet.create({
                userId: 'user1',
                balance: 13,
            })

            const result = await graphql({
                schema,
                source: query({
                    name: 'walletBalance',
                }),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert.equal(result.data.walletBalance, 13)
        })
    })
})

import assert from 'assert'
import { graphql } from 'graphql'
import { DEFAULT_CONFIG, updateConfig, graphqlSchemaFactory, query } from '@orderify/app'
import { SequelizeFactory } from '@orderify/io'
import { walletOperationsServiceFactory } from '../service'

const sequelize = SequelizeFactory(updateConfig(DEFAULT_CONFIG, process.env).DATABASE)
const {
    Wallet,
    walletOperations,
    walletOperationsGraphql,
} = walletOperationsServiceFactory(sequelize)
const schema = graphqlSchemaFactory(walletOperationsGraphql)

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

        it('success - deposit', async () => {
            await Wallet.create({
                userId: 'user1',
                balance: 13,
            })

            await walletOperations.deposit('user1', 10)

            const result = await graphql({
                schema,
                source: query({
                    name: 'walletBalance',
                }),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert.equal(result.data.walletBalance, 23)
        })

        it('success - withdraw', async () => {
            await Wallet.create({
                userId: 'user1',
                balance: 13,
            })

            await walletOperations.withdraw('user1', 10)

            const result = await graphql({
                schema,
                source: query({
                    name: 'walletBalance',
                }),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert.equal(result.data.walletBalance, 3)
        })

        it('fail - withdraw more than balance', async () => {
            await Wallet.create({
                userId: 'user1',
                balance: 13,
            })

            assert.rejects(walletOperations.withdraw('user1', 20))
        })
    })
})

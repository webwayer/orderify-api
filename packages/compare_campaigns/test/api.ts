import { compareCampaignsSericeFactory } from '../src/service'
import { DEFAULT_CONFIG, updateConfig, graphqlFactory } from '@orderify/app'
import { SequelizeFactory } from '@orderify/io'
import { graphql } from 'graphql'
import { mutation, query } from './graphqlQuery'
import { IImageLibraryApi } from '@orderify/image_library'
import assert from 'assert'

class StubImageLibraryApi implements IImageLibraryApi {
    public async findImageById(id: string) {
        if (!id.startsWith('_')) {
            return {
                id,
                userId: 'user1',
                albumId: 'album1',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            }
        }
    }
}

const sequelize = SequelizeFactory(updateConfig(DEFAULT_CONFIG, process.env).DATABASE)
const {
    compareCampaignsInterface,
    Campaign,
    Comparison,
    Wallet,
    walletApi,
} = compareCampaignsSericeFactory(sequelize, new StubImageLibraryApi())
const schema = graphqlFactory(compareCampaignsInterface.query, compareCampaignsInterface.mutation)

describe('Compare Campaigns', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
    })

    describe('randomActiveCampaign', () => {
        it('success', async () => {
            await Campaign.bulkCreate(
                Array(10).fill(null).map((_, i) => ({
                    id: i.toString(),
                    userId: `user${i}`,
                    photo1Id: `photo1${i}`,
                    photo2Id: `photo2${i}`,
                })),
            )

            const result = await graphql({
                schema,
                source: query(
                    'randomActiveCampaign',
                    ['id', 'userId', 'photo1Id', 'photo2Id', 'comparisonsCount'],
                ),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert(result.data.randomActiveCampaign)
        })

        it('success - return normal first', async () => {
            await Campaign.bulkCreate(
                [{
                    id: 'campaign1',
                    userId: `user2`,
                    photo1Id: `photo1`,
                    photo2Id: `photo2`,
                }, {
                    id: 'campaign2',
                    userId: `user2`,
                    photo1Id: `photo1`,
                    photo2Id: `photo2`,
                    type: 'filler',
                }],
            )

            const result = await graphql({
                schema,
                source: query(
                    'randomActiveCampaign',
                    ['id', 'userId', 'photo1Id', 'photo2Id', 'comparisonsCount'],
                ),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert.equal(result.data.randomActiveCampaign.id, 'campaign1')
        })

        it('success - return filler otherwise', async () => {
            await Campaign.bulkCreate(
                [{
                    id: 'campaign1',
                    userId: `user1`,
                    photo1Id: `photo1`,
                    photo2Id: `photo2`,
                }, {
                    id: 'campaign2',
                    userId: `user2`,
                    photo1Id: `photo1`,
                    photo2Id: `photo2`,
                    type: 'filler',
                }],
            )

            const result = await graphql({
                schema,
                source: query(
                    'randomActiveCampaign',
                    ['id', 'userId', 'photo1Id', 'photo2Id', 'comparisonsCount'],
                ),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert.equal(result.data.randomActiveCampaign.id, 'campaign2')
        })

        it('success - return only not mine', async () => {
            await Campaign.bulkCreate(
                Array(2).fill(null).map((_, i) => ({
                    id: i.toString(),
                    userId: `user${i + 1}`,
                    photo1Id: `photo1${i + 1}`,
                    photo2Id: `photo2${i + 1}`,
                })),
            )

            const result = await graphql({
                schema,
                source: query(
                    'randomActiveCampaign',
                    ['id', 'userId', 'photo1Id', 'photo2Id', 'comparisonsCount'],
                ),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert.equal(result.data.randomActiveCampaign.userId, 'user2')
        })

        it('fail - not return if voted', async () => {
            await Campaign.bulkCreate(
                Array(10).fill(null).map((_, i) => ({
                    id: i.toString(),
                    userId: `user${i}`,
                    photo1Id: `photo1${i}`,
                    photo2Id: `photo2${i}`,
                    comparators: ['user1'],
                })),
            )

            const result = await graphql({
                schema,
                source: query(
                    'randomActiveCampaign',
                    ['id', 'userId', 'photo1Id', 'photo2Id', 'comparisonsCount'],
                ),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert(!result.data.randomActiveCampaign)
        })

        it('fail - not return finished', async () => {
            await Campaign.bulkCreate(
                Array(10).fill(null).map((_, i) => ({
                    id: i.toString(),
                    userId: `user${i}`,
                    photo1Id: `photo1${i}`,
                    photo2Id: `photo2${i}`,
                    status: 'finished',
                })),
            )

            const result = await graphql({
                schema,
                source: query(
                    'randomActiveCampaign',
                    ['id', 'userId', 'photo1Id', 'photo2Id', 'comparisonsCount'],
                ),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert(!result.data.randomActiveCampaign)
        })

        it('fail - not return mine', async () => {
            await Campaign.bulkCreate(
                Array(1).fill(null).map((_, i) => ({
                    id: i.toString(),
                    userId: `user${i + 1}`,
                    photo1Id: `photo1${i + 1}`,
                    photo2Id: `photo2${i + 1}`,
                })),
            )

            const result = await graphql({
                schema,
                source: query(
                    'randomActiveCampaign',
                    ['id', 'userId', 'photo1Id', 'photo2Id', 'comparisonsCount'],
                ),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert(!result.data.randomActiveCampaign)
        })
    })

    describe('startCampaign', () => {
        it('success', async () => {
            await Wallet.create({
                userId: 'user1',
                balance: 20,
            })

            const result = await graphql({
                schema,
                source: mutation(
                    'startCampaign',
                    { photo1Id: 'photo1', photo2Id: 'photo2' },
                    ['id', 'userId', 'photo1Id', 'photo2Id', 'comparisonsCount'],
                ),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert(result.data.startCampaign)
        })

        it('fail - not enough funds', async () => {
            const result = await graphql({
                schema,
                source: mutation(
                    'startCampaign',
                    { photo1Id: 'photo1', photo2Id: 'photo2' },
                    ['id', 'userId', 'photo1Id', 'photo2Id', 'comparisonsCount'],
                ),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert(!result.data.startCampaign)
        })

        it('fail - not owner of photos', async () => {
            await Wallet.create({
                userId: 'user1',
                balance: 20,
            })

            const result = await graphql({
                schema,
                source: mutation(
                    'startCampaign',
                    { photo1Id: 'photo1', photo2Id: 'photo2' },
                    ['id', 'userId', 'photo1Id', 'photo2Id', 'comparisonsCount'],
                ),
                contextValue: {
                    userId: 'user2',
                },
            })

            assert(!result.data.startCampaign)
        })

        it('fail - no photos', async () => {
            await Wallet.create({
                userId: 'user1',
                balance: 20,
            })

            const result = await graphql({
                schema,
                source: mutation(
                    'startCampaign',
                    { photo1Id: '_photo1', photo2Id: '_photo2' },
                    ['id', 'userId', 'photo1Id', 'photo2Id', 'comparisonsCount'],
                ),
                contextValue: {
                    userId: 'user2',
                },
            })

            assert(!result.data.startCampaign)
        })
    })

    describe('submitComparison', () => {
        it('success', async () => {
            await Campaign.create({
                id: 'campaign1',
                userId: 'user1',
                photo1Id: 'photo1',
                photo2Id: 'photo2',
                comparisonsCount: 10,
            })

            const result = await graphql({
                schema,
                source: mutation(
                    'submitComparison',
                    { campaignId: 'campaign1', photoWinnerId: 'photo1' },
                    ['id', 'userId', 'campaignId', 'photoWinnerId'],
                ),
                contextValue: {
                    userId: 'user2',
                },
            })

            assert(result.data.submitComparison)
        })

        it('success - balance updated', async () => {
            await Campaign.create({
                id: 'campaign1',
                userId: 'user1',
                photo1Id: 'photo1',
                photo2Id: 'photo2',
                comparisonsCount: 10,
            })

            const result = await graphql({
                schema,
                source: mutation(
                    'submitComparison',
                    { campaignId: 'campaign1', photoWinnerId: 'photo1' },
                    ['id', 'userId', 'campaignId', 'photoWinnerId'],
                ),
                contextValue: {
                    userId: 'user2',
                },
            })

            assert(result.data.submitComparison)
            assert.equal(await walletApi.balance('user2'), 1)
        })

        it('success - last comparison', async () => {
            await Campaign.create({
                id: 'campaign1',
                userId: 'user1',
                photo1Id: 'photo1',
                photo2Id: 'photo2',
                comparisonsCount: 1,
            })

            const result = await graphql({
                schema,
                source: mutation(
                    'submitComparison',
                    { campaignId: 'campaign1', photoWinnerId: 'photo1' },
                    ['id', 'userId', 'campaignId', 'photoWinnerId'],
                ),
                contextValue: {
                    userId: 'user2',
                },
            })

            assert(result.data.submitComparison)

            const result2 = await graphql({
                schema,
                source: mutation(
                    'submitComparison',
                    { campaignId: 'campaign1', photoWinnerId: 'photo1' },
                    ['id', 'userId', 'campaignId', 'photoWinnerId'],
                ),
                contextValue: {
                    userId: 'user3',
                },
            })

            assert(!result2.data.submitComparison)
        })

        it('fail - no campaign', async () => {
            const result = await graphql({
                schema,
                source: mutation(
                    'submitComparison',
                    { campaignId: 'campaign1', photoWinnerId: 'photo1' },
                    ['id', 'userId', 'campaignId', 'photoWinnerId'],
                ),
                contextValue: {
                    userId: 'user2',
                },
            })

            assert(!result.data.submitComparison)
        })

        it('fail - owner', async () => {
            await Campaign.create({
                id: 'campaign1',
                userId: 'user1',
                photo1Id: 'photo1',
                photo2Id: 'photo2',
                comparisonsCount: 10,
            })

            const result = await graphql({
                schema,
                source: mutation(
                    'submitComparison',
                    { campaignId: 'campaign1', photoWinnerId: 'photo1' },
                    ['id', 'userId', 'campaignId', 'photoWinnerId'],
                ),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert(!result.data.submitComparison)
        })

        it('fail - wrong photoWinnerId', async () => {
            await Campaign.create({
                id: 'campaign1',
                userId: 'user1',
                photo1Id: 'photo1',
                photo2Id: 'photo2',
                comparisonsCount: 10,
            })

            const result = await graphql({
                schema,
                source: mutation(
                    'submitComparison',
                    { campaignId: 'campaign1', photoWinnerId: 'photo3' },
                    ['id', 'userId', 'campaignId', 'photoWinnerId'],
                ),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert(!result.data.submitComparison)
        })

        it('fail - campaign finished', async () => {
            await Campaign.create({
                id: 'campaign1',
                userId: 'user1',
                photo1Id: 'photo1',
                photo2Id: 'photo2',
                comparisonsCount: 10,
                status: 'finished',
            })

            const result = await graphql({
                schema,
                source: mutation(
                    'submitComparison',
                    { campaignId: 'campaign1', photoWinnerId: 'photo1' },
                    ['id', 'userId', 'campaignId', 'photoWinnerId'],
                ),
                contextValue: {
                    userId: 'user2',
                },
            })

            assert(!result.data.submitComparison)
        })

        it('fail - already voted', async () => {
            await Campaign.create({
                id: 'campaign1',
                userId: 'user1',
                photo1Id: 'photo1',
                photo2Id: 'photo2',
                comparisonsCount: 10,
            })

            await Comparison.create({
                id: 'comparison',
                userId: 'user2',
                photoWinnerId: 'photo1',
                campaignId: 'campaign1',
            })

            const result = await graphql({
                schema,
                source: mutation(
                    'submitComparison',
                    { campaignId: 'campaign1', photoWinnerId: 'photo1' },
                    ['id', 'userId', 'campaignId', 'photoWinnerId'],
                ),
                contextValue: {
                    userId: 'user2',
                },
            })

            assert(!result.data.submitComparison)
        })
    })
})

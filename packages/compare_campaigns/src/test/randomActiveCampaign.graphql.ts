import assert from 'assert'
import { graphql } from 'graphql'
import { query } from '@orderify/app'

import {
    sequelize,
    Campaign,
    schema,
    campaignDefaultFields,
} from './service'

describe('Compare Campaigns', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
    })

    describe('randomActiveCampaign', () => {
        it('success', async () => {
            await Campaign.bulkCreate(
                Array(10).fill(null).map((_, i) => ({
                    id: `${i}`,
                    userId: `user${i}`,
                    photo1Id: `photo1${i}`,
                    photo2Id: `photo2${i}`,
                })),
            )

            const result = await graphql({
                schema,
                source: query({
                    name: 'randomActiveCampaign',
                    fields: campaignDefaultFields,
                }),
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
                source: query({
                    name: 'randomActiveCampaign',
                    fields: campaignDefaultFields,
                }),
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
                source: query({
                    name: 'randomActiveCampaign',
                    fields: campaignDefaultFields,
                }),
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
                source: query({
                    name: 'randomActiveCampaign',
                    fields: campaignDefaultFields,
                }),
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
                source: query({
                    name: 'randomActiveCampaign',
                    fields: campaignDefaultFields,
                }),
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
                source: query({
                    name: 'randomActiveCampaign',
                    fields: campaignDefaultFields,
                }),
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
                source: query({
                    name: 'randomActiveCampaign',
                    fields: campaignDefaultFields,
                }),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert(!result.data.randomActiveCampaign)
        })
    })
})

import assert from 'assert'
import { graphql } from 'graphql'
import { graphqlMutation } from '@orderify/io'

import {
    sequelize,
    schema,
    Campaign,
    comparisonDefaultFields,
} from '../service'

describe('Compare Campaigns', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
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
                source: graphqlMutation({
                    name: 'submitComparison',
                    args: {
                        campaignId: 'campaign1',
                        selectedPhotoPosition: { enum: 'left' },
                        selectedPhotoId: 'photo1',
                    },
                    fields: comparisonDefaultFields,
                }),
                contextValue: {
                    userId: 'user2',
                },
            })

            assert(result.data.submitComparison)
        })

        it('success - last comparison', async () => {
            await Campaign.create({
                id: 'campaign1',
                userId: 'user1',
                photo1Id: 'photo1',
                photo2Id: 'photo2',
                comparators: ['1'],
                comparisonsCount: 2,
            })

            const result = await graphql({
                schema,
                source: graphqlMutation({
                    name: 'submitComparison',
                    args: {
                        campaignId: 'campaign1',
                        selectedPhotoPosition: { enum: 'left' },
                        selectedPhotoId: 'photo1',
                    },
                    fields: comparisonDefaultFields,
                }),
                contextValue: {
                    userId: 'user2',
                },
            })

            assert(result.data.submitComparison)

            const result2 = await graphql({
                schema,
                source: graphqlMutation({
                    name: 'submitComparison',
                    args: {
                        campaignId: 'campaign1',
                        selectedPhotoPosition: { enum: 'left' },
                        selectedPhotoId: 'photo1',
                    },
                    fields: comparisonDefaultFields,
                }),
                contextValue: {
                    userId: 'user3',
                },
            })

            assert(!result2.data.submitComparison)
        })

        it('fail - no campaign', async () => {
            const result = await graphql({
                schema,
                source: graphqlMutation({
                    name: 'submitComparison',
                    args: {
                        campaignId: 'campaign1',
                        selectedPhotoPosition: { enum: 'left' },
                        selectedPhotoId: 'photo1',
                    },
                    fields: comparisonDefaultFields,
                }),
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
                source: graphqlMutation({
                    name: 'submitComparison',
                    args: {
                        campaignId: 'campaign1',
                        selectedPhotoPosition: { enum: 'left' },
                        selectedPhotoId: 'photo1',
                    },
                    fields: comparisonDefaultFields,
                }),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert(!result.data.submitComparison)
        })

        it('fail - wrong selectedPhotoId', async () => {
            await Campaign.create({
                id: 'campaign1',
                userId: 'user1',
                photo1Id: 'photo1',
                photo2Id: 'photo2',
                comparisonsCount: 10,
            })

            const result = await graphql({
                schema,
                source: graphqlMutation({
                    name: 'submitComparison',
                    args: {
                        campaignId: 'campaign1',
                        selectedPhotoPosition: { enum: 'left' },
                        selectedPhotoId: 'photo3',
                    },
                    fields: comparisonDefaultFields,
                }),
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
                source: graphqlMutation({
                    name: 'submitComparison',
                    args: {
                        campaignId: 'campaign1',
                        selectedPhotoPosition: { enum: 'left' },
                        selectedPhotoId: 'photo1',
                    },
                    fields: comparisonDefaultFields,
                }),
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
                comparators: ['user2'],
            })

            const result = await graphql({
                schema,
                source: graphqlMutation({
                    name: 'submitComparison',
                    args: {
                        campaignId: 'campaign1',
                        selectedPhotoPosition: { enum: 'left' },
                        selectedPhotoId: 'photo1',
                    },
                    fields: comparisonDefaultFields,
                }),
                contextValue: {
                    userId: 'user2',
                },
            })

            assert(!result.data.submitComparison)
        })
    })
})

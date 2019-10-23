import assert from 'assert'
import { graphql } from 'graphql'
import { graphqlMutation } from '@orderify/io'

import {
    sequelize,
    schema,
    campaignDefaultFields,
} from '../service'

describe('Compare Campaigns', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
    })

    describe('startCampaign', () => {
        it('success', async () => {
            const result = await graphql({
                schema,
                source: graphqlMutation({
                    name: 'startCampaign',
                    args: { photo1Id: 'photo1', photo2Id: 'photo2' },
                    fields: campaignDefaultFields,
                }),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert(result.data.startCampaign)
        })

        it('fail - not owner of photos', async () => {
            const result = await graphql({
                schema,
                source: graphqlMutation({
                    name: 'startCampaign',
                    args: { photo1Id: 'photo1', photo2Id: 'photo2' },
                    fields: campaignDefaultFields,
                }),
                contextValue: {
                    userId: 'user2',
                },
            })

            assert(!result.data.startCampaign)
        })

        it('fail - no photos', async () => {
            const result = await graphql({
                schema,
                source: graphqlMutation({
                    name: 'startCampaign',
                    args: { photo1Id: '_photo1', photo2Id: '_photo2' },
                    fields: campaignDefaultFields,
                }),
                contextValue: {
                    userId: 'user2',
                },
            })

            assert(!result.data.startCampaign)
        })
    })
})

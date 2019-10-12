import {
    GraphQLList,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLInt,
} from 'graphql'

import { CompareCampaignsApi } from './CompareCampaignsApi'
import { WalletApi } from './WalletApi'

const defaultCampaignFields = {
    id: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLString) },
    photo1Id: { type: new GraphQLNonNull(GraphQLString) },
    photo2Id: { type: new GraphQLNonNull(GraphQLString) },
    status: { type: new GraphQLNonNull(GraphQLString) },
}

const CampaignType = new GraphQLObjectType({
    name: 'Campaign',
    fields: {
        ...defaultCampaignFields,
    },
})

const CampaignWithResultsType = new GraphQLObjectType({
    name: 'CampaignWithResults',
    fields: {
        ...defaultCampaignFields,
        results: { type: new GraphQLList(GraphQLString) },
    },
})

const ComparisonType = new GraphQLObjectType({
    name: 'Comparison',
    fields: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLString) },
        campaignId: { type: new GraphQLNonNull(GraphQLString) },
        photoWinnerId: { type: new GraphQLNonNull(GraphQLString) },
    },
})

export function CompareCampaignsGraphqlFactory(
    compareCampaignsApi: CompareCampaignsApi,
    walletApi: WalletApi,
) {
    return {
        mutation: {
            startCampaign: {
                type: CampaignType,
                args: {
                    photo1Id: {
                        type: new GraphQLNonNull(GraphQLString),
                    },
                    photo2Id: {
                        type: new GraphQLNonNull(GraphQLString),
                    },
                },
                async resolve(_, { photo1Id, photo2Id }, { userId }) {
                    return compareCampaignsApi.startCampaign(userId, photo1Id, photo2Id)
                },
            },
            submitComparison: {
                type: ComparisonType,
                args: {
                    campaignId: {
                        type: new GraphQLNonNull(GraphQLString),
                    },
                    photoWinnerId: {
                        type: new GraphQLNonNull(GraphQLString),
                    },
                },
                async resolve(_, { campaignId, photoWinnerId }, { userId }) {
                    return compareCampaignsApi.submitComparison(userId, campaignId, photoWinnerId)
                },
            },
        },
        query: {
            randomActiveCampaign: {
                type: CampaignType,
                async resolve(_, where, { userId }) {
                    return compareCampaignsApi.randomActiveCampaign(userId)
                },
            },
            walletBalance: {
                type: new GraphQLNonNull(GraphQLInt),
                async resolve(_, where, { userId }) {
                    return walletApi.balance(userId)
                },
            },
            activeCampaigns: {
                type: new GraphQLList(CampaignType),
                async resolve(_, where, { userId }) {
                    return compareCampaignsApi.activeCampaigns(userId)
                },
            },
            finishedCampaigns: {
                type: new GraphQLList(CampaignWithResultsType),
                async resolve(_, where, { userId }) {
                    return compareCampaignsApi.finishedCampaigns(userId)
                },
            },
        },
    }
}

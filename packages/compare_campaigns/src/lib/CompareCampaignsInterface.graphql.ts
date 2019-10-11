import {
    GraphQLList,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLInt,
} from 'graphql'
import { Sequelize } from 'sequelize'

import { IComparisonStatic } from './Comparison'
import { ICampaignStatic } from './Campaign'
import { CompareCampaignsApi } from './CompareCampaignsApi'

export function CompareCampaignsGraphqlFactory(
    Comparison: IComparisonStatic,
    Campaign: ICampaignStatic,
    compareCampaignsApi: CompareCampaignsApi,
) {
    const CampaignType = new GraphQLObjectType({
        name: 'Campaign',
        fields: {
            id: { type: new GraphQLNonNull(GraphQLString) },
            userId: { type: new GraphQLNonNull(GraphQLString) },
            photo1Id: { type: new GraphQLNonNull(GraphQLString) },
            photo2Id: { type: new GraphQLNonNull(GraphQLString) },
            comparisonsCount: { type: new GraphQLNonNull(GraphQLInt) },
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
                async resolve(_, { photo1Id, photo2Id }: any, req) {
                    return compareCampaignsApi.startCampaign(req.userId, photo1Id, photo2Id)
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
                async resolve(_, { campaignId, photoWinnerId }: any, req) {
                    return Comparison.create({
                        userId: req.userId,
                        campaignId,
                        photoWinnerId,
                    })
                },
            },
        },
        query: {
            randomActiveCampaign: {
                type: CampaignType,
                async resolve(_, where, req) {
                    return Campaign.findOne({
                        where: {
                            status: 'active',
                        },
                        order: Sequelize.literal('random()'),
                    })
                },
            },
            Campaigns: {
                type: new GraphQLList(CampaignType),
                args: {
                    id: {
                        type: GraphQLString,
                    },
                    userId: {
                        type: new GraphQLNonNull(GraphQLString),
                    },
                },
                async resolve(_, where, req) {
                    // tslint:disable-next-line: curly
                    if (where.userId === 'me') where.userId = req.userId

                    return Campaign.findAll({ where })
                },
            },
            Comparisons: {
                type: new GraphQLList(ComparisonType),
                args: {
                    id: {
                        type: GraphQLString,
                    },
                    userId: {
                        type: new GraphQLNonNull(GraphQLString),
                    },
                },
                async resolve(_, where, req) {
                    // tslint:disable-next-line: curly
                    if (where.userId === 'me') where.userId = req.userId

                    return Comparison.findAll({ where })
                },
            },
        },
    }
}

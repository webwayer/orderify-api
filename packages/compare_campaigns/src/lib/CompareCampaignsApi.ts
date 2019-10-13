import { Op, literal } from 'sequelize'

import { IImageLibraryApi } from '@orderify/image_library'
import { IWalletOperationsApi } from '@orderify/wallet_operations'

import { ICampaignStatic } from './Campaign'
import { IComparisonStatic } from './Comparison'

import { prop, propEq, equals } from 'ramda'

export class CompareCampaignsApi {
    constructor(
        private Campaign: ICampaignStatic,
        private Comparison: IComparisonStatic,
        private walletOperationsApi: IWalletOperationsApi,
        private imageLibraryApi: IImageLibraryApi,
    ) { }

    public async activeCampaigns(userId: string) {
        return (await this.Campaign.findAll({
            where: {
                status: 'active',
                userId,
            },
        })).map(c => c.toJSON())
    }

    public async finishedCampaigns(userId: string) {
        const campaigns = (await this.Campaign.findAll({
            where: {
                status: 'finished',
                userId,
            },
        })).map(c => c.toJSON())

        const comparisons = await this.Comparison.findAll({
            where: {
                id: {
                    [Op.in]: campaigns.map(prop('id')),
                },
            },
        })

        const campaingsWithResults = campaigns.map(cam => ({
            ...cam,
            selectedPhotoIds: comparisons.filter(propEq('campaignId', cam.id)).map(prop('selectedPhotoId')),
        }))

        return campaingsWithResults
    }

    public async randomActiveCampaign(userId: string) {
        const normalCampaign = await this.Campaign.findOne({
            where: {
                status: 'active',
                type: 'normal',
                userId: {
                    [Op.not]: userId,
                },
                [Op.not]: {
                    comparators: {
                        [Op.contains]: [userId],
                    },
                },
            },
            order: literal('random()'),
        })

        const fillerCampaign = await this.Campaign.findOne({
            where: {
                status: 'active',
                type: 'filler',
                [Op.not]: {
                    comparators: {
                        [Op.contains]: [userId],
                    },
                },
            },
            order: literal('random()'),
        })

        return normalCampaign || fillerCampaign
    }

    public async startCampaign(userId: string, photo1Id: string, photo2Id: string) {
        const photo1 = await this.imageLibraryApi.findImageById(photo1Id)
        const photo2 = await this.imageLibraryApi.findImageById(photo2Id)

        if (photo1Id === photo2Id) {
            throw new Error('photos ids are identical')
        }

        if (!photo1) {
            throw new Error('photo1 doesnt exist')
        }

        if (!photo2) {
            throw new Error('photo2 doesnt exist')
        }

        if (photo1.userId !== userId) {
            throw new Error('user isnt owner of photo1')
        }

        if (photo2.userId !== userId) {
            throw new Error('user isnt owner of photo2')
        }

        await this.walletOperationsApi.withdraw(userId, 20)

        return this.Campaign.create({
            userId,
            photo1Id,
            photo2Id,
        })
    }

    public async submitComparison(
        userId: string,
        campaignId: string,
        selectedPhotoId: string,
        selectedPhotoPosition: 'left' | 'right',
    ) {
        const campaign = await this.Campaign.findByPk(campaignId)

        if (!campaign) {
            throw new Error('no campaign')
        }

        if ((campaign.photo1Id !== selectedPhotoId && campaign.photo2Id !== selectedPhotoId)) {
            throw new Error('selectedPhotoId isnt in campaign')
        }

        if (campaign.status !== 'active') {
            throw new Error('campaign isnt active')
        }

        if (campaign.userId === userId) {
            throw new Error('user who votes cant be creator of campaign')
        }

        if (campaign.comparators.find(equals(userId))) {
            throw new Error('user already voted')
        }

        if (campaign.comparators.length === campaign.comparisonsCount - 1) {
            await this.Campaign.update({
                status: 'finished',
            }, {
                where: {
                    id: campaignId,
                },
            })
        }

        await this.Campaign.update({
            comparators: [userId, ...campaign.comparators],
        }, {
            where: {
                id: campaignId,
            },
        })

        await this.walletOperationsApi.deposit(userId, 1)

        return this.Comparison.create({
            userId,
            campaignId,
            selectedPhotoId,
            selectedPhotoPosition,
        })
    }
}

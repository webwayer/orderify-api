import { Op, literal } from 'sequelize'

import { IImageLibrary } from '@orderify/image_library'
import { IWalletOperations } from '@orderify/wallet_operations'

import { ICampaign } from './_/Campaign'
import { IComparison } from './_/Comparison'

import { COMPARE_CAMPAIGNS_CONFIG } from '../../config'

import { prop, propEq, equals } from 'ramda'

export class CompareCampaigns {
    constructor(
        private CONFIG: typeof COMPARE_CAMPAIGNS_CONFIG,
        private Campaign: ICampaign,
        private Comparison: IComparison,
        private WalletOperations: IWalletOperations,
        private imageLibrary: IImageLibrary,
    ) { }

    public async activeCampaigns(userId: string) {
        return await this.Campaign.findAll({
            where: {
                status: 'active',
                userId,
            },
        })
    }

    public async finishedCampaigns(userId: string) {
        const campaigns = await this.Campaign.findAll({
            where: {
                status: 'finished',
                userId,
            },
        })

        const comparisons = await this.Comparison.findAll({
            where: {
                campaignId: {
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
        const photo1 = await this.imageLibrary.findImageById(photo1Id)
        const photo2 = await this.imageLibrary.findImageById(photo2Id)

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

        await this.WalletOperations.withdraw(userId, parseInt(this.CONFIG.COSTS.CAMPAIGN_COST, 10))

        return this.Campaign.create({
            userId,
            photo1Id,
            photo2Id,
            comparisonsCount: parseInt(this.CONFIG.COMPARISONS.TO_FINISH, 10),
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

        await this.WalletOperations.deposit(userId, parseInt(this.CONFIG.COSTS.COMPARISON_REWARD, 10))

        return this.Comparison.create({
            userId,
            campaignId,
            selectedPhotoId,
            selectedPhotoPosition,
        })
    }
}

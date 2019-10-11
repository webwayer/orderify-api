import { Op, literal } from 'sequelize'

import { IImageLibraryApi } from '@orderify/image_library'

import { ICampaignStatic } from './Campaign'
import { IComparisonStatic } from './Comparison'
import { WalletApi } from './WalletApi'

export class CompareCampaignsApi {
    constructor(
        private Campaign: ICampaignStatic,
        private Comparison: IComparisonStatic,
        private walletApi: WalletApi,
        private imageLibraryApi: IImageLibraryApi,
    ) { }

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

        return normalCampaign || fillerCampaign
    }

    public async startCampaign(userId: string, photo1Id: string, photo2Id: string) {
        const photo1 = await this.imageLibraryApi.findImageById(photo1Id)
        const photo2 = await this.imageLibraryApi.findImageById(photo2Id)

        const isPhotosIdentical = photo1Id === photo2Id
        const isPhoto1Exists = !!photo1
        const isPhoto2Exists = !!photo2
        const isPhoto1Owner = isPhoto1Exists && photo1.userId === userId
        const isPhoto2Owner = isPhoto2Exists && photo2.userId === userId

        if (!isPhotosIdentical && isPhoto1Owner && isPhoto2Owner) {
            await this.walletApi.withdraw(userId, 20)

            return this.Campaign.create({
                userId,
                comparisonsCount: 10,
                photo1Id,
                photo2Id,
            })
        }
    }

    public async submitComparison(userId: string, campaignId: string, photoWinnerId: string) {
        const campaign = await this.Campaign.findByPk(campaignId)
        const comparisons = await this.Comparison.findAll({
            where: {
                campaignId,
            },
        })

        const isCampaignExists = !!campaign
        const isCampaignActive = isCampaignExists && campaign.status === 'active'
        const isCreator = isCampaignExists && userId === campaign.userId
        const isAlreadyVoted = !!comparisons.find(c => c.userId === userId)
        const isLastComparison = isCampaignActive && comparisons.length === campaign.comparisonsCount - 1
        const isPhotoInCampaign = isCampaignExists &&
            (campaign.photo1Id === photoWinnerId || campaign.photo2Id === photoWinnerId)

        if (isCampaignExists && isCampaignActive && isPhotoInCampaign && !isCreator && !isAlreadyVoted) {
            await this.walletApi.deposit(userId, 1)

            if (isLastComparison) {
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

            return this.Comparison.create({
                userId,
                campaignId,
                photoWinnerId,
            })
        }
    }
}

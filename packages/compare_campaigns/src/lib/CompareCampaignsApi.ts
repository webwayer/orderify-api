import { ICampaignStatic } from './Campaign'
import { IComparisonStatic } from './Comparison'
import { WalletApi } from './WalletApi'
import { IImageLibraryApi } from '@orderify/image_library'

export class CompareCampaignsApi {
    constructor(
        private Campaign: ICampaignStatic,
        private Comparison: IComparisonStatic,
        private walletApi: WalletApi,
        private imageLibraryApi: IImageLibraryApi,
    ) { }

    public async startCampaign(userId: string, photo1Id: string, photo2Id: string) {
        const photo1 = await this.imageLibraryApi.findImageById(photo1Id)
        const photo2 = await this.imageLibraryApi.findImageById(photo2Id)

        const isPhoto1Exists = !!photo1
        const isPhoto2Exists = !!photo2
        const isPhoto1Owner = isPhoto1Exists && photo1.userId === userId
        const isPhoto2Owner = isPhoto2Exists && photo2.userId === userId

        if (isPhoto1Owner && isPhoto2Owner) {
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

            return this.Comparison.create({
                userId,
                campaignId,
                photoWinnerId,
            })
        }
    }
}

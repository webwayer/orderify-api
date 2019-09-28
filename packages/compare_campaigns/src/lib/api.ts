import { ICampaignStatic } from './Campaign'

export function CampaignsApiFactory(Campaign: ICampaignStatic) {
    async function createCampaign(userId: string, photo1Id: string, photo2Id: string) {
        return 1
    }

    return {
        createCampaign,
    }
}

export type ICampaignsApi = ReturnType<typeof CampaignsApiFactory>

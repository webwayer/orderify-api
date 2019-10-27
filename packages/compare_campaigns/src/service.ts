import { Sequelize } from 'sequelize'

import {
    CampaignFactory,
    ComparisonFactory,
    CompareCampaignsGraphqlFactory,
    CompareCampaigns,
    COMPARE_CAMPAIGNS_CONFIG,
} from './'

import { IImageLibrary } from '@orderify/image_library'
import { IWalletOperations } from '@orderify/wallet_operations'

export function compareCampaignsServiceFactory(
    CONFIG: typeof COMPARE_CAMPAIGNS_CONFIG,
    sequelize: Sequelize,
    imageLibrary: IImageLibrary,
    WalletOperations: IWalletOperations,
) {
    const Campaign = CampaignFactory(sequelize)
    const Comparison = ComparisonFactory(sequelize)
    const compareCampaigns = new CompareCampaigns(CONFIG, Campaign, Comparison, WalletOperations, imageLibrary)
    const compareCampaignsGraphql = CompareCampaignsGraphqlFactory(compareCampaigns)

    return { Comparison, Campaign, compareCampaigns, compareCampaignsGraphql }
}

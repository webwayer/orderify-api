import { Sequelize } from 'sequelize'

import {
    CampaignFactory,
    ComparisonFactory,
    CompareCampaignsGraphqlFactory,
    CompareCampaignsApi,
} from './'

import { IImageLibraryApi } from '@orderify/image_library'
import { IwalletOperations } from '@orderify/wallet_operations'

export function compareCampaignsServiceFactory(
    sequelize: Sequelize,
    imageLibraryApi: IImageLibraryApi,
    WalletOperations: IwalletOperations,
) {
    const Campaign = CampaignFactory(sequelize)
    const Comparison = ComparisonFactory(sequelize)
    const compareCampaignsApi = new CompareCampaignsApi(Campaign, Comparison, WalletOperations, imageLibraryApi)
    const compareCampaignsGraphql = CompareCampaignsGraphqlFactory(compareCampaignsApi)

    return { Comparison, Campaign, compareCampaignsApi, compareCampaignsGraphql }
}

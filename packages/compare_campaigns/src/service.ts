import { Sequelize } from 'sequelize'

import {
    CampaignFactory,
    ComparisonFactory,
    CompareCampaignsGraphqlFactory,
    CompareCampaignsApi,
} from './'

import { IImageLibraryApi } from '@orderify/image_library'
import { IWalletOperationsApi } from '@orderify/wallet_operations'

export function compareCampaignsServiceFactory(
    sequelize: Sequelize,
    imageLibraryApi: IImageLibraryApi,
    walletOperationsApi: IWalletOperationsApi,
) {
    const Campaign = CampaignFactory(sequelize)
    const Comparison = ComparisonFactory(sequelize)
    const compareCampaignsApi = new CompareCampaignsApi(Campaign, Comparison, walletOperationsApi, imageLibraryApi)
    const compareCampaignsGraphql = CompareCampaignsGraphqlFactory(compareCampaignsApi)

    return { Comparison, Campaign, compareCampaignsApi, compareCampaignsGraphql }
}

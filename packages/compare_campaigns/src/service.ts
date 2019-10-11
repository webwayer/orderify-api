import { Sequelize } from 'sequelize'

import {
    CampaignFactory,
    ComparisonFactory,
    CompareCampaignsGraphqlFactory,
    CompareCampaignsApi,
    WalletFactory,
    WalletApi,
} from './'

import { IImageLibraryApi } from '@orderify/image_library'

export function compareCampaignsSericeFactory(sequelize: Sequelize, imageLibraryApi: IImageLibraryApi) {
    const Wallet = WalletFactory(sequelize)
    const walletApi = new WalletApi(Wallet)

    const Campaign = CampaignFactory(sequelize)
    const Comparison = ComparisonFactory(sequelize)
    const compareCampaignsApi = new CompareCampaignsApi(Campaign, Comparison, walletApi, imageLibraryApi)

    const compareCampaignsInterface = CompareCampaignsGraphqlFactory(compareCampaignsApi, walletApi)

    return { Wallet, walletApi, Comparison, Campaign, compareCampaignsApi, compareCampaignsInterface }
}

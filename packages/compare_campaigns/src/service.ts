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

export default function (sequelize: Sequelize, imageLibraryApi: IImageLibraryApi) {
    const Campaign = CampaignFactory(sequelize)
    const Comparison = ComparisonFactory(sequelize)
    const Wallet = WalletFactory(sequelize)

    const walletApi = new WalletApi(Wallet)
    const compareCampaignsApi = new CompareCampaignsApi(Campaign, Comparison, walletApi, imageLibraryApi)
    const compareCampaignsInterface = CompareCampaignsGraphqlFactory(Comparison, Campaign, compareCampaignsApi)

    return { Wallet, walletApi, Comparison, Campaign, compareCampaignsApi, compareCampaignsInterface }
}

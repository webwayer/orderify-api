import { Sequelize } from 'sequelize'

import { CampaignFactory, ComparisonFactory, CompareCampaignsGraphqlFactory, CompareCampaignsApi } from './'
import { IImageLibraryApi } from '@orderify/image_library'

export default function (sequelize: Sequelize, imageLibraryApi: IImageLibraryApi) {
    const Campaign = CampaignFactory(sequelize)
    const Comparison = ComparisonFactory(sequelize)

    const compareCampaignsApi = new CompareCampaignsApi(Campaign, imageLibraryApi)
    const compareCampaignsInterface = CompareCampaignsGraphqlFactory(Comparison, Campaign, compareCampaignsApi)

    return { Comparison, Campaign, compareCampaignsApi, compareCampaignsInterface }
}

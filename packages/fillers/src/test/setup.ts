import { SequelizeFactory, IO_CONFIG, updateConfig } from '@orderify/io'
import { AlbumFactory, ImageFactory } from '@orderify/image_library'
import { CampaignFactory } from '@orderify/compare_campaigns'

export const sequelize = SequelizeFactory(updateConfig(IO_CONFIG, process.env).DATABASE)

export const Album = AlbumFactory(sequelize)
export const Image = ImageFactory(sequelize)
export const Campaign = CampaignFactory(sequelize)

export async function imageToNowhere(image: string) {
    return
}

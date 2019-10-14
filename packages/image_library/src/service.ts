import { Sequelize } from 'sequelize'

import {
    AlbumFactory,
    ImageFactory,
    ImageStorage,
    ImageLibrary,
    ImageLibraryGraphqlFactory,
} from './'

export function imageLibraryServiceFactory(
    sequelize: Sequelize,
    s3: AWS.S3,
    lambda: AWS.Lambda,
    CONFIG: any,
) {
    const Album = AlbumFactory(sequelize)
    const Image = ImageFactory(sequelize)
    const imageStorage = new ImageStorage(s3, lambda, CONFIG.STORAGE)
    const imageLibraty = new ImageLibrary(Image, Album)
    const imageLibraryGraphql = ImageLibraryGraphqlFactory(imageLibraty, imageStorage)

    return { Album, Image, imageStorage, imageLibraty, imageLibraryGraphql }
}

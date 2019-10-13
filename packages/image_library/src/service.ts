import { Sequelize } from 'sequelize'

import {
    AlbumFactory,
    ImageFactory,
    ImageStorage,
    ImageLibraryApi,
    ImageLibraryReadGraphQLFactory,
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
    const imageLibraryReadGraphQL = ImageLibraryReadGraphQLFactory(Album, Image, imageStorage)
    const imageLibratyApi = new ImageLibraryApi(Image)

    return { Album, Image, imageStorage, imageLibratyApi, imageLibraryReadGraphQL }
}

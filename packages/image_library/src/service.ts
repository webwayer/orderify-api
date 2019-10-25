import { Sequelize } from 'sequelize'

import { IJobs } from '@orderify/io'

import {
    AlbumFactory,
    ImageFactory,
    ImageStorage,
    ImageLibrary,
    ImageLibraryGraphqlFactory,
    IMAGE_LIBRARY_CONFIG,
} from './'

export function imageLibraryServiceFactory(
    CONFIG_STORAGE: typeof IMAGE_LIBRARY_CONFIG.STORAGE,
    sequelize: Sequelize,
    jobs: IJobs,
) {
    const Album = AlbumFactory(sequelize)
    const Image = ImageFactory(sequelize)
    const imageStorage = new ImageStorage(CONFIG_STORAGE, jobs)
    const imageLibrary = new ImageLibrary(Image, Album)
    const imageLibraryGraphql = ImageLibraryGraphqlFactory(imageLibrary, imageStorage)

    return { Album, Image, imageStorage, imageLibrary, imageLibraryGraphql }
}

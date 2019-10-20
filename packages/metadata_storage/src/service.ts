import { Sequelize } from 'sequelize'
import {
    MetadataFactory,
    MetadataStorage,
} from './'

export function metadataStorageServiceFactory(
    sequelize: Sequelize,
) {
    const Metadata = MetadataFactory(sequelize)
    const usersMetadataStorage = new MetadataStorage(Metadata, 'FACEBOOK', 'USER', 'USER')
    const imagesMetadataStorage = new MetadataStorage(Metadata, 'FACEBOOK', 'PHOTO', 'IMAGE')
    const albumsMetadataStorage = new MetadataStorage(Metadata, 'FACEBOOK', 'ALBUM', 'ALBUM')

    return { Metadata, usersMetadataStorage, imagesMetadataStorage, albumsMetadataStorage }
}

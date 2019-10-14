import { Sequelize } from 'sequelize'
import {
    MetadataFactory,
    MetadataStorage,
} from './'

export function metadataStorageServiceFactory(
    sequelize: Sequelize,
) {
    const Metadata = MetadataFactory(sequelize)
    const metadataStorage = new MetadataStorage(Metadata)

    return { Metadata, metadataStorage }
}

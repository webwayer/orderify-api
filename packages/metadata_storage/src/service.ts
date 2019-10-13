import { Sequelize } from 'sequelize'
import {
    MetadataFactory,
} from './'

export function metadataStorageServiceFactory(
    sequelize: Sequelize,
) {
    const Metadata = MetadataFactory(sequelize)

    return { Metadata }
}

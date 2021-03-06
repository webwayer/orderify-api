import { simpleSequelizeModelFactory } from '@orderify/io'
import { Sequelize, DataTypes } from 'sequelize'
import shortUUID from 'short-uuid'

export function MetadataFactory(
    sequelize: Sequelize,
) {
    return simpleSequelizeModelFactory<IMetadataProps>(sequelize.define('Metadata', {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true,
            defaultValue: shortUUID().generate,
        },
        instanceId: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        instanceType: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        source: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        sourceType: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        userId: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        data: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
    }, {
        paranoid: true,
    }))
}

export type IMetadata = ReturnType<typeof MetadataFactory>
export interface IMetadataProps {
    instanceId: string
    instanceType: 'USER' | 'ALBUM' | 'IMAGE'
    source: 'FACEBOOK'
    sourceType: 'USER' | 'PHOTO' | 'ALBUM'
    userId: string
    data: any
}

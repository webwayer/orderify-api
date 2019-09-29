import { ISSStaticRead, ISSStaticWrite, ISSTimestampsParanoid } from '@orderify/io'
import { Sequelize, DataTypes } from 'sequelize'
import shortUUID from 'short-uuid'

export function MetadataFactory(
    sequelize: Sequelize,
) {
    const Metadata = sequelize.define('Metadata', {
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
    })

    return Metadata as unknown as IMetadataStatic
}

export type IMetadataStaticRead = ISSStaticRead<IMetadataProps, ISSTimestampsParanoid>
export type IMetadataStaticWrite = ISSStaticWrite<IMetadataProps, ISSTimestampsParanoid>
export type IMetadataStatic = IMetadataStaticRead & IMetadataStaticWrite
interface IMetadataProps {
    instanceId: string
    instanceType: 'USER' | 'ALBUM' | 'IMAGE'
    source: 'FACEBOOK.USER' | 'FACEBOOK.PHOTO' | 'FACEBOOK.ALBUM'
    userId: string
    data: any
}

import { ISSStaticRead, ISSStaticWrite, ISSTimestampsParanoid } from '@orderify/io'
import { Sequelize, DataTypes } from 'sequelize'
import shortUUID from 'short-uuid'

export async function AlbumFactory(
    sequelize: Sequelize,
) {
    const Album = sequelize.define('Album', {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true,
            defaultValue: shortUUID().generate,
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: true,
        },
        userId: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
    }, {
        paranoid: true,
    })

    return Album as unknown as IAlbumStatic
}

export type IAlbumStaticRead = ISSStaticRead<IAlbumProps, ISSTimestampsParanoid>
export type IAlbumStaticWrite = ISSStaticWrite<IAlbumProps, ISSTimestampsParanoid>
export type IAlbumStatic = IAlbumStaticRead & IAlbumStaticWrite
interface IAlbumProps {
    userId: string
    name?: string
}

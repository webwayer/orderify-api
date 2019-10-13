import { simpleSequelizeModelFactory } from '@orderify/io'
import { Sequelize, DataTypes } from 'sequelize'
import shortUUID from 'short-uuid'

export function AlbumFactory(
    sequelize: Sequelize,
) {
    return simpleSequelizeModelFactory<IAlbumProps>(sequelize.define('Album', {
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
    }))
}

export type IAlbum = ReturnType<typeof AlbumFactory>
interface IAlbumProps {
    userId: string
    name?: string
}

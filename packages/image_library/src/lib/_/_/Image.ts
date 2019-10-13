import { simpleSequelizeModelFactory } from '@orderify/io'
import { Sequelize, DataTypes } from 'sequelize'
import shortUUID from 'short-uuid'

export function ImageFactory(
    sequelize: Sequelize,
) {
    return simpleSequelizeModelFactory<IImageProps>(sequelize.define('Image', {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true,
            defaultValue: shortUUID().generate,
        },
        albumId: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        userId: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
    }, {
        paranoid: true,
    }))
}

export type IImage = ReturnType<typeof ImageFactory>
interface IImageProps {
    albumId: string
    userId: string
}

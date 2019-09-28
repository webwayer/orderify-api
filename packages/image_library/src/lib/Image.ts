import { ISSStaticRead, ISSStaticWrite, ISSTimestampsParanoid } from '@orderify/io'
import { Sequelize, DataTypes } from 'sequelize'
import shortUUID from 'short-uuid'

export function ImageFactory(
    sequelize: Sequelize,
) {
    const Image = sequelize.define('Image', {
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
    })

    return Image as unknown as IImageStatic
}

export type IImageStaticRead = ISSStaticRead<IImageProps, ISSTimestampsParanoid>
export type IImageStaticWrite = ISSStaticWrite<IImageProps, ISSTimestampsParanoid>
export type IImageStatic = IImageStaticRead & IImageStaticWrite
interface IImageProps {
    albumId: string
    userId: string
}

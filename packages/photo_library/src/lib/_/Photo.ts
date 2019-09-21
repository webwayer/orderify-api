import { ISSStatic, SequelizeDataTypes, SequelizeType, SequelizeModel } from '@orderify/io'

export async function PhotoFactory(
    sequelize: SequelizeType,
    CONFIG: { DROP_ON_SYNC: string; SYNC_SCHEMAS: string },
) {
    class Photo extends SequelizeModel { }

    Photo.init({
        width: {
            type: SequelizeDataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        height: {
            type: SequelizeDataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        name: {
            type: SequelizeDataTypes.STRING(128),
            allowNull: true,
        },
        alt_text: {
            type: SequelizeDataTypes.STRING(512),
            allowNull: true,
        },
        link: {
            type: SequelizeDataTypes.STRING(256),
            allowNull: false,
        },
        albumId: {
            type: SequelizeDataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        userId: {
            type: SequelizeDataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
    }, {
        tableName: 'Photo',
        sequelize,
    })

    if (CONFIG.SYNC_SCHEMAS) {
        await Photo.sync({ force: !!CONFIG.DROP_ON_SYNC })
    }

    return Photo as unknown as IPhotoStatic
}

export type IPhotoStatic = ISSStatic<IPhotoProps>
interface IPhotoProps {
    albumId: number
    alt_text?: string
    height: number
    link: string
    name?: string
    userId: number
    width: number
}

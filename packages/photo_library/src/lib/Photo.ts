import { ISSStatic, SequelizeDataTypes, SequelizeType, SequelizeModel } from '@orderify/io'

export async function PhotoFactory(
    sequelize: SequelizeType,
    CONFIG: { DROP_ON_SYNC: string; SYNC_SCHEMAS: string },
) {
    class Photo extends SequelizeModel { }

    Photo.init({
        id: {
            type: SequelizeDataTypes.STRING(32),
            primaryKey: true,
        },
        albumId: {
            type: SequelizeDataTypes.STRING(32),
            allowNull: false,
        },
        userId: {
            type: SequelizeDataTypes.STRING(32),
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
    id: string
    albumId: string
    userId: string
}

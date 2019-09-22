import { ISSStatic, SequelizeDataTypes, SequelizeType, SequelizeModel } from '@orderify/io'

export async function AlbumFactory(
    sequelize: SequelizeType,
    CONFIG: { DROP_ON_SYNC: string; SYNC_SCHEMAS: string },
) {
    class Album extends SequelizeModel { }

    Album.init({
        userId: {
            type: SequelizeDataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        name: {
            type: SequelizeDataTypes.STRING(128),
            allowNull: true,
        },
    }, {
        tableName: 'Album',
        sequelize,
    })

    if (CONFIG.SYNC_SCHEMAS) {
        await Album.sync({ force: !!CONFIG.DROP_ON_SYNC })
    }

    return Album as unknown as IAlbumStatic
}

export type IAlbumStatic = ISSStatic<IAlbumProps>
interface IAlbumProps {
    userId: number
    name?: string
}

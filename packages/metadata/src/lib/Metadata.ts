import { ISSStatic, SequelizeDataTypes, SequelizeType, SequelizeModel } from '@orderify/io'

export async function MetadataFactory(
    sequelize: SequelizeType,
    CONFIG: { DROP_ON_SYNC: string; SYNC_SCHEMAS: string },
) {
    class Metadata extends SequelizeModel { }

    Metadata.init({
        id: {
            type: SequelizeDataTypes.STRING(32),
            primaryKey: true,
        },
        sourceId: {
            type: SequelizeDataTypes.STRING(32),
            allowNull: false,
        },
        sourceType: {
            type: SequelizeDataTypes.STRING(128),
            allowNull: false,
        },
        data: {
            type: SequelizeDataTypes.JSON,
            allowNull: false,
        },
    }, {
        tableName: 'Metadata',
        sequelize,
    })

    if (CONFIG.SYNC_SCHEMAS) {
        await Metadata.sync({ force: !!CONFIG.DROP_ON_SYNC })
    }

    return Metadata as unknown as IMetadataStatic
}

export type IMetadataStatic = ISSStatic<IMetadataProps>
interface IMetadataProps {
    id: string
    sourceId: string
    sourceType: string
    data: any
}

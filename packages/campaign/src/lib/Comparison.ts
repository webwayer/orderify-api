import { ISSStatic, SequelizeDataTypes, SequelizeType, SequelizeModel } from '@orderify/io'

export async function ComparisonFactory(
    sequelize: SequelizeType,
    CONFIG: { DROP_ON_SYNC: string; SYNC_SCHEMAS: string },
) {
    class Comparison extends SequelizeModel { }

    Comparison.init({
        id: {
            type: SequelizeDataTypes.STRING(32),
            primaryKey: true,
        },
        campaignId: {
            type: SequelizeDataTypes.STRING(32),
            allowNull: false,
        },
        userId: {
            type: SequelizeDataTypes.STRING(32),
            allowNull: false,
        },
        photoWinnerId: {
            type: SequelizeDataTypes.STRING(32),
            allowNull: false,
        },
    }, {
        tableName: 'Comparison',
        sequelize,
        paranoid: true,
    })

    if (CONFIG.SYNC_SCHEMAS) {
        await Comparison.sync({ force: !!CONFIG.DROP_ON_SYNC })
    }

    return Comparison as unknown as IComparisonStatic
}

export type IComparisonStatic = ISSStatic<IComparisonProps>
interface IComparisonProps {
    id: string
    campaignId: string
    userId: string
    photoWinnerId: string
}

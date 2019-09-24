import { ISSStatic, SequelizeDataTypes, SequelizeType, SequelizeModel } from '@orderify/io'

export async function CampaignFactory(
    sequelize: SequelizeType,
    CONFIG: { DROP_ON_SYNC: string; SYNC_SCHEMAS: string },
) {
    class Campaign extends SequelizeModel { }

    Campaign.init({
        id: {
            type: SequelizeDataTypes.STRING(32),
            primaryKey: true,
        },
        userId: {
            type: SequelizeDataTypes.STRING(32),
            allowNull: false,
        },
        photo1Id: {
            type: SequelizeDataTypes.STRING(32),
            allowNull: false,
        },
        photo2Id: {
            type: SequelizeDataTypes.STRING(32),
            allowNull: false,
        },
        comparisonsCount: {
            type: SequelizeDataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: 'Campaign',
        sequelize,
        paranoid: true,
    })

    if (CONFIG.SYNC_SCHEMAS) {
        await Campaign.sync({ force: !!CONFIG.DROP_ON_SYNC })
    }

    return Campaign as unknown as ICampaignStatic
}

export type ICampaignStatic = ISSStatic<ICampaignProps>
interface ICampaignProps {
    id: string
    userId: string
    photo1Id: string
    photo2Id: string
    comparisonsCount: number
}

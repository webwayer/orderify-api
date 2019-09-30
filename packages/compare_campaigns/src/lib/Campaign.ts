import { ISSStaticRead, ISSStaticWrite, ISSTimestampsParanoid } from '@orderify/io'
import { DataTypes, Sequelize } from 'sequelize'
import shortUUID from 'short-uuid'

export function CampaignFactory(
    sequelize: Sequelize,
) {
    return sequelize.define('Campaign', {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true,
            defaultValue: shortUUID().generate,
        },
        userId: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        photo1Id: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        photo2Id: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        comparisonsCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(32),
            allowNull: false,
            defaultValue: 'active',
        },
    }, {
        paranoid: true,
    }) as unknown as ICampaignStatic
}

export type ICampaignStaticRead = ISSStaticRead<ICampaignProps, ISSTimestampsParanoid>
export type ICampaignStaticWrite = ISSStaticWrite<ICampaignProps, ISSTimestampsParanoid>
export type ICampaignStatic = ICampaignStaticRead & ICampaignStaticWrite
interface ICampaignProps {
    userId: string
    photo1Id: string
    photo2Id: string
    comparisonsCount: number
    status?: 'active'
}

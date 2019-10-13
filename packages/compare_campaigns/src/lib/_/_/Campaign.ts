import { simpleSequelizeModelFactory } from '@orderify/io'
import { DataTypes, Sequelize } from 'sequelize'
import shortUUID from 'short-uuid'

export function CampaignFactory(
    sequelize: Sequelize,
) {
    return simpleSequelizeModelFactory<ICampaignProps>(sequelize.define('Campaign', {
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
            defaultValue: 10,
        },
        comparators: {
            type: DataTypes.ARRAY(DataTypes.STRING(32)),
            allowNull: false,
            defaultValue: [],
        },
        status: {
            type: DataTypes.ENUM('active', 'finished'),
            allowNull: false,
            defaultValue: 'active',
        },
        type: {
            type: DataTypes.ENUM('normal', 'filler'),
            allowNull: false,
            defaultValue: 'normal',
        },
    }, {
        paranoid: true,
    }))
}

export type ICampaign = ReturnType<typeof CampaignFactory>
interface ICampaignProps {
    userId: string
    photo1Id: string
    photo2Id: string
    comparisonsCount?: number
    status?: 'active' | 'finished'
    type?: 'normal' | 'filler'
    comparators?: string[]
}

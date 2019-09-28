
import { ISSStaticRead, ISSStaticWrite, ISSTimestampsParanoid } from '@orderify/io'
import { DataTypes, Sequelize } from 'sequelize'
import shortUUID from 'short-uuid'

export function ComparisonFactory(
    sequelize: Sequelize,
) {
    return sequelize.define('Comparison', {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true,
            defaultValue: shortUUID().generate,
        },
        campaignId: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        userId: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        photoWinnerId: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
    }, {
        paranoid: true,
    }) as unknown as IComparisonStatic
}

export type IComparisonStaticRead = ISSStaticRead<IComparisonProps, ISSTimestampsParanoid>
export type IComparisonStaticWrite = ISSStaticWrite<IComparisonProps, ISSTimestampsParanoid>
export type IComparisonStatic = IComparisonStaticRead & IComparisonStaticWrite
interface IComparisonProps {
    campaignId: string
    userId: string
    photoWinnerId: string
}

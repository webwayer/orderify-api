import { simpleSequelizeModelFactory } from '@orderify/io'
import { DataTypes, Sequelize } from 'sequelize'
import shortUUID from 'short-uuid'

export function ComparisonFactory(
    sequelize: Sequelize,
) {
    return simpleSequelizeModelFactory<IComparisonProps>(sequelize.define('Comparison', {
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
        selectedPhotoId: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        selectedPhotoPosition: {
            type: DataTypes.ENUM('left', 'right'),
            allowNull: false,
        },
    }, {
        paranoid: true,
    }))
}

export type IComparison = ReturnType<typeof ComparisonFactory>
interface IComparisonProps {
    campaignId: string
    userId: string
    selectedPhotoId: string
    selectedPhotoPosition: 'left' | 'right'
}

import { simpleSequelizeModelFactory } from '@orderify/io'
import { Sequelize, DataTypes } from 'sequelize'
import shortUUID from 'short-uuid'

export function AccessTokenFactory(
    sequelize: Sequelize,
) {
    return simpleSequelizeModelFactory<IAccessTokenProps>(sequelize.define('AccessToken', {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true,
            defaultValue: shortUUID().generate,
        },
        userId: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
    }))
}

export type IAccessToken = ReturnType<typeof AccessTokenFactory>
interface IAccessTokenProps {
    userId: string
}

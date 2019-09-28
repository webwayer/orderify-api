import { ISSStaticRead, ISSStaticWrite, ISSTimestamps } from '@orderify/io'
import { Sequelize, DataTypes } from 'sequelize'
import shortUUID from 'short-uuid'

export function AccessTokenFactory(
    sequelize: Sequelize,
) {
    const AccessToken = sequelize.define('AccessToken', {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true,
            defaultValue: shortUUID().generate,
        },
        userId: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
    })

    return AccessToken as unknown as IAccessTokenStatic
}

export type IAccessTokenStaticRead = ISSStaticRead<IAccessTokenProps, ISSTimestamps>
export type IAccessTokenStaticWrite = ISSStaticWrite<IAccessTokenProps, ISSTimestamps>
export type IAccessTokenStatic = IAccessTokenStaticRead & IAccessTokenStaticWrite
interface IAccessTokenProps {
    userId: string
}

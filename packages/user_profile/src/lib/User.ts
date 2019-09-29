import { ISSStaticRead, ISSStaticWrite, ISSTimestampsParanoid } from '@orderify/io'
import { Sequelize, DataTypes } from 'sequelize'
import shortUUID from 'short-uuid'

export function UserFactory(
    sequelize: Sequelize,
) {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true,
            defaultValue: shortUUID().generate,
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(128),
            allowNull: false,
            unique: true,
        },
    }, {
        paranoid: true,
    })

    return User as unknown as IUserStatic
}

export type IUserStaticRead = ISSStaticRead<IUserProps, ISSTimestampsParanoid>
export type IUserStaticWrite = ISSStaticWrite<IUserProps, ISSTimestampsParanoid>
export type IUserStatic = IUserStaticRead & IUserStaticWrite
interface IUserProps {
    email: string
    name: string
}

import { simpleSequelizeModelFactory } from '@orderify/io'
import { Sequelize, DataTypes } from 'sequelize'
import shortUUID from 'short-uuid'

export function UserFactory(
    sequelize: Sequelize,
) {
    return simpleSequelizeModelFactory<IUserProps>(sequelize.define('User', {
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
    }))
}

export type IUser = ReturnType<typeof UserFactory>
interface IUserProps {
    email: string
    name: string
}

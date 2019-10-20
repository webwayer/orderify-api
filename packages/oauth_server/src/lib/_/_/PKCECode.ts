import { simpleSequelizeModelFactory } from '@orderify/io'
import { Sequelize, DataTypes } from 'sequelize'
import shortUUID from 'short-uuid'

export function PKCECodeFactory(
    sequelize: Sequelize,
) {
    return simpleSequelizeModelFactory<IPKCECodeProps>(sequelize.define('PKCECode', {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true,
            defaultValue: shortUUID().generate,
        },
        state: {
            type: DataTypes.STRING(256),
            allowNull: false,
        },
        code_challenge: {
            type: DataTypes.STRING(256),
            allowNull: false,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }))
}

export type IPKCECode = ReturnType<typeof PKCECodeFactory>
interface IPKCECodeProps {
    state: string
    expiresAt: Date
    code_challenge: string
}

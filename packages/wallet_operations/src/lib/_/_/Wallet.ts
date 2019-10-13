import { simpleSequelizeModelFactory } from '@orderify/io'
import { DataTypes, Sequelize } from 'sequelize'
import shortUUID from 'short-uuid'

export function WalletFactory(
    sequelize: Sequelize,
) {
    return simpleSequelizeModelFactory<IWalletProps>(sequelize.define('Wallet', {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true,
            defaultValue: shortUUID().generate,
        },
        userId: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        balance: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    }, {
        paranoid: true,
    }))
}

export type IWallet = ReturnType<typeof WalletFactory>
interface IWalletProps {
    userId: string
    balance?: number
}

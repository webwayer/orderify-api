import { ISSStaticRead, ISSStaticWrite, ISSTimestampsParanoid } from '@orderify/io'
import { DataTypes, Sequelize } from 'sequelize'
import shortUUID from 'short-uuid'

export function WalletFactory(
    sequelize: Sequelize,
) {
    return sequelize.define('Wallet', {
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
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
    }, {
        paranoid: true,
    }) as unknown as IWalletStatic
}

export type IWalletStaticRead = ISSStaticRead<IWalletProps, ISSTimestampsParanoid>
export type IWalletStaticWrite = ISSStaticWrite<IWalletProps, ISSTimestampsParanoid>
export type IWalletStatic = IWalletStaticRead & IWalletStaticWrite
interface IWalletProps {
    userId: string
    balance?: number
}

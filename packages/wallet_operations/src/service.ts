import { Sequelize } from 'sequelize'

import {
    WalletFactory,
    WalletOperations,
    walletOperationsGraphqlFactory,
} from './'

export function walletOperationsServiceFactory(sequelize: Sequelize) {
    const Wallet = WalletFactory(sequelize)
    const walletOperations = new WalletOperations(Wallet)
    const walletOperationsGraphql = walletOperationsGraphqlFactory(walletOperations)

    return { Wallet, walletOperations, walletOperationsGraphql }
}

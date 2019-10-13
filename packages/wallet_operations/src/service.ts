import { Sequelize } from 'sequelize'

import {
    WalletFactory,
    WalletOperationsApi,
    walletOperationsGraphqlFactory,
} from './'

export function walletOperationsServiceFactory(sequelize: Sequelize) {
    const Wallet = WalletFactory(sequelize)
    const walletOperationsApi = new WalletOperationsApi(Wallet)
    const walletOperationsGraphql = walletOperationsGraphqlFactory(walletOperationsApi)

    return { Wallet, walletOperationsApi, walletOperationsGraphql }
}

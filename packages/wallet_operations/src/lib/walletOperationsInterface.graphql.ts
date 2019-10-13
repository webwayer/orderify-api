import {
    GraphQLNonNull,
    GraphQLInt,
} from 'graphql'

import { WalletOperationsApi } from './_/WalletOperationsApi'

export function walletOperationsGraphqlFactory(
    walletOperationsApi: WalletOperationsApi,
) {
    return {
        query: {
            walletBalance: {
                type: new GraphQLNonNull(GraphQLInt),
                async resolve(_, where, { userId }) {
                    return walletOperationsApi.balance(userId)
                },
            },
        },
    }
}

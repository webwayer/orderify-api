import {
    GraphQLNonNull,
    GraphQLInt,
} from 'graphql'

import { WalletOperations } from './_/WalletOperations'

export function walletOperationsGraphqlFactory(
    walletOperations: WalletOperations,
) {
    return {
        query: {
            walletBalance: {
                type: new GraphQLNonNull(GraphQLInt),
                async resolve(_, where, { userId }) {
                    return walletOperations.balance(userId)
                },
            },
        },
    }
}

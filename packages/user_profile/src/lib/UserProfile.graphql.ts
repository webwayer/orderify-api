import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
} from 'graphql'

import { IUser } from './_/_/User'

export function UserProfileGraphQLFactory(
    User: IUser,
) {
    const UserType = new GraphQLObjectType({
        name: 'User',
        fields: {
            id: { type: new GraphQLNonNull(GraphQLString) },
            email: { type: new GraphQLNonNull(GraphQLString) },
            name: { type: new GraphQLNonNull(GraphQLString) },
        },
    })

    return {
        query: {
            me: {
                type: UserType,
                async resolve(_, where, { userId }) {
                    return User.findByPk(userId)
                },
            },
        },
    }
}

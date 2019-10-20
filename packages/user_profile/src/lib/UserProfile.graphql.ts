import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
} from 'graphql'

import { UserProfile } from './_/UserProfile'

export function UserProfileGraphQLFactory(
    userProfile: UserProfile,
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
                    return userProfile.findById(userId)
                },
            },
        },
    }
}

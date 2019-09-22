import {
    GraphQLList,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLNonNull,
} from 'graphql'

import { IUserStatic } from './User'

export function UserInterfaceFactory(
    User: IUserStatic,
) {
    const UserType = new GraphQLObjectType({
        name: 'User',
        fields: () => ({
            id: { type: new GraphQLNonNull(GraphQLInt) },
            email: { type: new GraphQLNonNull(GraphQLString) },
            name: { type: new GraphQLNonNull(GraphQLString) },
        }),
    })

    return {
        users: {
            type: new GraphQLList(UserType),
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLInt),
                },
            },
            async resolve(_, where) {
                return User.findAll({ where })
            },
        },
    }
}

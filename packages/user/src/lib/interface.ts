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
            id: { type: new GraphQLNonNull(GraphQLString) },
            email: { type: new GraphQLNonNull(GraphQLString) },
            name: { type: new GraphQLNonNull(GraphQLString) },
        }),
    })

    return {
        users: {
            type: new GraphQLList(UserType),
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLString),
                },
            },
            async resolve(_, where, req) {
                // tslint:disable-next-line: curly
                if (where.id === 'me') where.userId = req.userId

                return User.findAll({ where })
            },
        },
    }
}

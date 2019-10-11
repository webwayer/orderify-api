import { GraphQLFieldConfigMap, GraphQLObjectType, GraphQLSchema } from 'graphql'

export function graphqlFactory(query: GraphQLFieldConfigMap<any, any>, mutation: GraphQLFieldConfigMap<any, any>) {
    const QueryRootType = new GraphQLObjectType({
        name: 'Query',
        fields: query,
    })

    const MutationRootType = new GraphQLObjectType({
        name: 'Mutation',
        fields: mutation,
    })

    const AppSchema = new GraphQLSchema({
        query: QueryRootType,
        mutation: MutationRootType,
    })

    return AppSchema
}

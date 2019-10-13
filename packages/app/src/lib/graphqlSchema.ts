import { GraphQLFieldConfigMap, GraphQLObjectType, GraphQLSchema } from 'graphql'

export function graphqlSchemaFactory({ query, mutation }: {
    query?: GraphQLFieldConfigMap<any, any>,
    mutation?: GraphQLFieldConfigMap<any, any>,
}) {
    return new GraphQLSchema({
        query: query ? new GraphQLObjectType({
            name: 'Query',
            fields: query,
        }) : undefined,
        mutation: mutation ? new GraphQLObjectType({
            name: 'Mutation',
            fields: mutation,
        }) : undefined,
    })
}

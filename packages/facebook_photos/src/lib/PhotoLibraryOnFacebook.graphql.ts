import { PhotoLibraryOnFacebook } from './_/PhotoLibraryOnFacebook'
import { IUserProfileOnFacebook } from '@orderify/facebook_oauth'
import { GraphQLNonNull, GraphQLBoolean, GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql'

export function photoLibraryOnFacebookGraphqlFactory(
    photoLibraryOnFacebook: PhotoLibraryOnFacebook,
    userProfileOnFacebook: IUserProfileOnFacebook,
) {
    return {
        query: {
            facebookAlbums: {
                type: new GraphQLList(new GraphQLObjectType({
                    name: 'facebookAlbum',
                    fields: {
                        id: { type: new GraphQLNonNull(GraphQLString) },
                        name: { type: new GraphQLNonNull(GraphQLString) },
                        type: { type: new GraphQLNonNull(GraphQLString) },
                        created_time: { type: new GraphQLNonNull(GraphQLString) },
                        updated_time: { type: new GraphQLNonNull(GraphQLString) },
                    },
                })),
                async resolve(_, args, { userId }) {
                    const accessToken = await userProfileOnFacebook.findAccessTokenByUserId(userId)

                    if (!accessToken) {
                        throw new Error('facebook accessToken not found for current user')
                    }

                    return photoLibraryOnFacebook.getFBalbums(accessToken)
                },
            },
        },
        mutation: {
            facebookAlbumsSync: {
                type: new GraphQLObjectType({
                    name: 'result',
                    fields: {
                        result: { type: new GraphQLNonNull(GraphQLBoolean) },
                    },
                }),
                args: {
                    albumIds: {
                        type: new GraphQLList(GraphQLString),
                    },
                },
                async resolve(_, { albumIds }, { userId }) {
                    const accessToken = await userProfileOnFacebook.findAccessTokenByUserId(userId)

                    if (!accessToken) {
                        throw new Error('facebook accessToken not found for current user')
                    }

                    await photoLibraryOnFacebook.sync(accessToken, userId, albumIds || [])

                    return {
                        result: true,
                    }
                },
            },
        },
    }
}

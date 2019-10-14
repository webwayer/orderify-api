import { PhotoLibraryOnFacebook } from './_/PhotoLibraryOnFacebook'
import { UserProfileOnFacebook } from './_/UserProfileOnFacebook'
import { GraphQLNonNull, GraphQLBoolean, GraphQLObjectType } from 'graphql'

export function photoLibraryOnFacebookGraphqlFactory(
    photoLibraryOnFacebook: PhotoLibraryOnFacebook,
    userProfileOnFacebook: UserProfileOnFacebook,
) {
    return {
        mutation: {
            sync: {
                type: new GraphQLObjectType({
                    name: 'result',
                    fields: {
                        result: { type: new GraphQLNonNull(GraphQLBoolean) },
                    },
                }),
                async resolve(_, args, { userId }) {
                    const accessToken = await userProfileOnFacebook.findAccessTokenByUserId(userId)

                    if (accessToken) {
                        await photoLibraryOnFacebook.sync(accessToken, userId)

                        return {
                            result: true,
                        }
                    }

                    return {
                        result: false,
                    }
                },
            },
        }
    }
}

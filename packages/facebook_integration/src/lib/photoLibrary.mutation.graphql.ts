import { PhotoLibraryOnFacebook } from './PhotoLibraryOnFacebook'
import { IMetadataStaticRead } from '@orderify/metadata_storage'
import { GraphQLNonNull, GraphQLBoolean, GraphQLObjectType } from 'graphql'

export function photoLibraryGrapjQLMutationFactory(
    photoLibraryOnFacebook: PhotoLibraryOnFacebook,
    metadata: IMetadataStaticRead,
) {
    return {
        sync: {
            type: new GraphQLObjectType({
                name: 'result',
                fields: () => ({
                    result: { type: new GraphQLNonNull(GraphQLBoolean) },
                }),
            }),
            async resolve(_, args, req) {
                const userId = req.userId
                const facebookMetadata = await metadata.findOne({
                    where: {
                        instanceId: userId,
                        instanceType: 'USER',
                        source: 'FACEBOOK.USER',
                    },
                })

                if (facebookMetadata) {
                    await photoLibraryOnFacebook.sync(facebookMetadata.data.accessData.access_token, userId)

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

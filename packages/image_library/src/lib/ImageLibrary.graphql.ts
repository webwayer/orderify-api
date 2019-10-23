import {
    GraphQLList,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
} from 'graphql'

import { ImageStorage } from './_/ImageStorage'
import { IImageLibrary } from './_/ImageLibrary'

export function ImageLibraryGraphqlFactory(
    imageLibrary: IImageLibrary,
    imageStorage: ImageStorage,
) {
    const AlbumType = new GraphQLObjectType({
        name: 'Album',
        fields: {
            id: { type: new GraphQLNonNull(GraphQLString) },
            userId: { type: new GraphQLNonNull(GraphQLString) },
            name: { type: GraphQLString },
        },
    })

    const ImageType = new GraphQLObjectType({
        name: 'Image',
        fields: {
            id: { type: new GraphQLNonNull(GraphQLString) },
            userId: { type: new GraphQLNonNull(GraphQLString) },
            albumId: { type: new GraphQLNonNull(GraphQLString) },
            link: {
                type: new GraphQLNonNull(GraphQLString),
                resolve: source => {
                    return imageStorage.fileUrl(source.id)
                },
            },
        },
    })

    return {
        query: {
            albums: {
                type: new GraphQLList(AlbumType),
                async resolve(_, where, { userId }) {
                    return imageLibrary.findAlbumsByUserId(userId)
                },
            },
            images: {
                type: new GraphQLList(ImageType),
                args: {
                    albumId: {
                        type: new GraphQLNonNull(GraphQLString),
                    },
                },
                async resolve(_, { albumId }, { userId }) {
                    return imageLibrary.findImagesByUserIdAndAlbumId(userId, albumId)
                },
            },
        },
    }
}

import {
    GraphQLList,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
} from 'graphql'

import { IImage } from './_/_/Image'
import { IAlbum } from './_/_/Album'
import { ImageStorage } from './_/_/ImageStorage'

export function ImageLibraryReadGraphQLFactory(
    Album: IAlbum,
    Image: IImage,
    imageStorage: ImageStorage,
) {
    const AlbumType = new GraphQLObjectType({
        name: 'Album',
        fields: () => ({
            id: { type: new GraphQLNonNull(GraphQLString) },
            userId: { type: new GraphQLNonNull(GraphQLString) },
            name: { type: GraphQLString },
        }),
    })

    const ImageType = new GraphQLObjectType({
        name: 'Image',
        fields: () => ({
            id: { type: new GraphQLNonNull(GraphQLString) },
            userId: { type: new GraphQLNonNull(GraphQLString) },
            albumId: { type: new GraphQLNonNull(GraphQLString) },
            link: {
                type: new GraphQLNonNull(GraphQLString),
                resolve: source => {
                    return imageStorage.getPresignedImageUrl(source.id)
                },
            },
        }),
    })

    return {
        albums: {
            type: new GraphQLList(AlbumType),
            args: {
                id: {
                    type: GraphQLString,
                },
                userId: {
                    type: new GraphQLNonNull(GraphQLString),
                },
            },
            async resolve(_, where, req) {
                // tslint:disable-next-line: curly
                if (where.userId === 'me') where.userId = req.userId

                return Album.findAll({ where })
            },
        },
        photos: {
            type: new GraphQLList(ImageType),
            args: {
                id: {
                    type: GraphQLString,
                },
                userId: {
                    type: new GraphQLNonNull(GraphQLString),
                },
            },
            async resolve(_, where, req) {
                // tslint:disable-next-line: curly
                if (where.userId === 'me') where.userId = req.userId

                return Image.findAll({ where })
            },
        },
    }
}

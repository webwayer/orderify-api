import {
    GraphQLList,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLNonNull,
} from 'graphql'

import { IPhotoStatic } from './Photo'
import { IAlbumStatic } from './Album'
import { IImageStorage } from './photoStorage'

export function PhotoLibraryInterfaceFactory(
    Album: IAlbumStatic,
    Photo: IPhotoStatic,
    imageStorage: IImageStorage,
) {
    const AlbumType = new GraphQLObjectType({
        name: 'Album',
        fields: () => ({
            id: { type: new GraphQLNonNull(GraphQLString) },
            userId: { type: new GraphQLNonNull(GraphQLString) },
            name: { type: GraphQLString },
        }),
    })

    const PhotoType = new GraphQLObjectType({
        name: 'Photo',
        fields: () => ({
            id: { type: new GraphQLNonNull(GraphQLString) },
            userId: { type: new GraphQLNonNull(GraphQLString) },
            albumId: { type: new GraphQLNonNull(GraphQLString) },
            link: {
                type: new GraphQLNonNull(GraphQLString),
                resolve: (source) => {
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
            type: new GraphQLList(PhotoType),
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

                return Photo.findAll({ where })
            },
        },
    }
}

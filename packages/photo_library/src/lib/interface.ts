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

export function PhotoLibraryInterfaceFactory(
    Album: IAlbumStatic,
    Photo: IPhotoStatic,
) {
    const AlbumType = new GraphQLObjectType({
        name: 'Album',
        fields: () => ({
            id: { type: new GraphQLNonNull(GraphQLInt) },
            userId: { type: new GraphQLNonNull(GraphQLInt) },
            name: { type: GraphQLString },
        }),
    })

    const PhotoType = new GraphQLObjectType({
        name: 'Photo',
        fields: () => ({
            id: { type: new GraphQLNonNull(GraphQLInt) },
            userId: { type: new GraphQLNonNull(GraphQLInt) },
            albumId: { type: new GraphQLNonNull(GraphQLInt) },
            width: { type: new GraphQLNonNull(GraphQLInt) },
            height: { type: new GraphQLNonNull(GraphQLInt) },
            name: { type: GraphQLString },
            alt_text: { type: GraphQLString },
            link: { type: new GraphQLNonNull(GraphQLString) },
        }),
    })

    return {
        albums: {
            type: new GraphQLList(AlbumType),
            args: {
                id: {
                    type: GraphQLInt,
                },
                userId: {
                    type: new GraphQLNonNull(GraphQLInt),
                },
            },
            async resolve(_, where) {
                return Album.findAll({ where })
            },
        },
        photos: {
            type: new GraphQLList(PhotoType),
            args: {
                id: {
                    type: GraphQLInt,
                },
                userId: {
                    type: new GraphQLNonNull(GraphQLInt),
                },
            },
            async resolve(_, where) {
                return Photo.findAll({ where })
            },
        },
    }
}

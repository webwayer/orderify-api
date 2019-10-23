import request from 'request-promise'

import { SequelizeFactory, IO_CONFIG, graphqlSchemaFactory, updateConfig } from '@orderify/io'

import { metadataStorageServiceFactory } from '@orderify/metadata_storage'
import { imageLibraryServiceFactory } from '@orderify/image_library'
import { FacebookGraph } from '@orderify/facebook_oauth'

import { facebookPhotosServiceFactory } from '..'

export const sequelize = SequelizeFactory(updateConfig(IO_CONFIG, process.env).DATABASE)

export const { usersMetadataStorage, imagesMetadataStorage, albumsMetadataStorage } = metadataStorageServiceFactory(sequelize)
export const { imageLibraty, imageStorage } = imageLibraryServiceFactory({
    BUCKET_NAME: 'bucket',
}, sequelize, {
    async url_to_s3() { return },
})

export const { photoLibraryOnFacebook, photoLibraryOnFacebookGraphql } = facebookPhotosServiceFactory(
    imageLibraty,
    imageStorage,
    imagesMetadataStorage,
    albumsMetadataStorage,
    new FacebookGraph(request),
    {
        async findAccessTokenByUserId() { return 'fb_access_token' },
        async createOrUpdate() {
            return {
                id: '1',
                name: '1',
                email: '1',
                updatedAt: new Date(),
                createdAt: new Date(),
            }
        },
    },
)

export const schema = graphqlSchemaFactory(photoLibraryOnFacebookGraphql)

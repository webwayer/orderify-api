import express from 'express'
import request from 'request-promise'
import graphqlHTTP from 'express-graphql'
import { Sequelize } from 'sequelize'

import {
    graphqlSchemaFactory,
    IJobs,
} from '@orderify/io'

import { oauthServerServiceFactory } from '@orderify/oauth_server'
import { facebookPhotosServiceFactory } from '@orderify/facebook_photos'
import { facebookOauthServiceFactory } from '@orderify/facebook_oauth'
import { metadataStorageServiceFactory } from '@orderify/metadata_storage'
import { imageLibraryServiceFactory } from '@orderify/image_library'
import { userProfileServiceFactory } from '@orderify/user_profile'
import { compareCampaignsServiceFactory } from '@orderify/compare_campaigns'
import { walletOperationsServiceFactory } from '@orderify/wallet_operations'

import { DEFAULT_APP_CONFIG } from '../config'

export function appFactory(CONFIG: typeof DEFAULT_APP_CONFIG, sequelize: Sequelize, jobs: IJobs) {
    const { usersMetadataStorage, albumsMetadataStorage, imagesMetadataStorage } = metadataStorageServiceFactory(sequelize)
    const { userProfileGraphql, userProfile } = userProfileServiceFactory(sequelize)
    const { auth, jwtAccessToken, pkce, authGuardRouter } = oauthServerServiceFactory(CONFIG, sequelize)
    const { imageStorage, imageLibraty, imageLibraryGraphql } = imageLibraryServiceFactory(CONFIG.STORAGE, sequelize, jobs)
    const { walletOperations, walletOperationsGraphql } = walletOperationsServiceFactory(sequelize)
    const { facebookOauthRouter, facebookGraph, userProfileOnFacebook } =
        facebookOauthServiceFactory(CONFIG.API, CONFIG.OAUTH, CONFIG.FACEBOOK, request, usersMetadataStorage, userProfile, auth, pkce, jwtAccessToken)
    const { photoLibraryOnFacebookGraphql } =
        facebookPhotosServiceFactory(imageLibraty, imageStorage, imagesMetadataStorage, albumsMetadataStorage, facebookGraph, userProfileOnFacebook)
    const { compareCampaignsGraphql } = compareCampaignsServiceFactory(sequelize, imageLibraty, walletOperations)

    const app = express()

    app.use('/auth/facebook', facebookOauthRouter)
    app.use(authGuardRouter)

    const schema = graphqlSchemaFactory({
        query: {
            ...userProfileGraphql.query,
            ...imageLibraryGraphql.query,
            ...compareCampaignsGraphql.query,
            ...walletOperationsGraphql.query,
            ...photoLibraryOnFacebookGraphql.query,
        },
        mutation: {
            ...compareCampaignsGraphql.mutation,
            ...photoLibraryOnFacebookGraphql.mutation,
        },
    })

    app.use('/', graphqlHTTP({ schema }))

    app.use((err, req, res, next) => {
        // tslint:disable-next-line: no-console
        console.error(err)
        res.status(500).end()
    })

    return { app, schema }
}

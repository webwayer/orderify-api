import express from 'express'
import request from 'request-promise'
import graphqlHTTP from 'express-graphql'
import { graphqlSchemaFactory } from './graphqlSchema'

import {
    SequelizeFactory,
    S3Factory,
    LambdaFactory,
} from '@orderify/io'

import { facebookIntegrationServiceFactory } from '@orderify/facebook_integration'
import { metadataStorageServiceFactory } from '@orderify/metadata_storage'
import { imageLibraryServiceFactory } from '@orderify/image_library'
import { userProfileServiceFactory } from '@orderify/user_profile'
import { compareCampaignsServiceFactory } from '@orderify/compare_campaigns'
import { walletOperationsServiceFactory } from '@orderify/wallet_operations'

import { IAppConfig } from './config'

export async function appFactory(CONFIG: IAppConfig) {
    const sequelize = SequelizeFactory(CONFIG.DATABASE)
    const s3 = S3Factory(CONFIG.AWS)
    const lambda = LambdaFactory(CONFIG.AWS)

    const { metadataStorage } = metadataStorageServiceFactory(sequelize)
    const { auth, userProfileReadGraphQL, authenticatedRouter } = userProfileServiceFactory(sequelize, CONFIG)
    const { imageStorage, imageLibraty, imageLibraryGraphql } = imageLibraryServiceFactory(sequelize, s3, lambda, CONFIG)
    const { walletOperations, walletOperationsGraphql } = walletOperationsServiceFactory(sequelize)
    const { facebookLoginRouter, photoLibraryOnFacebookGraphql } = facebookIntegrationServiceFactory(request, imageLibraty, imageStorage, metadataStorage, auth, CONFIG)
    const { compareCampaignsGraphql } = compareCampaignsServiceFactory(sequelize, imageLibraty, walletOperations)

    const app = express()

    app.use(facebookLoginRouter)
    app.use(authenticatedRouter)

    const schema = graphqlSchemaFactory({
        query: {
            ...userProfileReadGraphQL,
            ...imageLibraryGraphql.query,
            ...compareCampaignsGraphql.query,
            ...walletOperationsGraphql.query,
        },
        mutation: {
            ...compareCampaignsGraphql.mutation,
            ...photoLibraryOnFacebookGraphql.mutation,
        },
    })

    app.use('/', graphqlHTTP({
        schema,
        graphiql: true,
    }))

    app.use((err, req, res, next) => {
        // tslint:disable-next-line: no-console
        console.error(err.stack)
        res.status(500).end()
    })

    if (CONFIG.SEQUELIZE.SYNC_SCHEMAS) {
        await sequelize.sync({ force: !!CONFIG.SEQUELIZE.DROP_ON_SYNC })
    }

    return app
}

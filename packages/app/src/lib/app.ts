import express from 'express'
import request from 'request-promise'
import graphqlHTTP from 'express-graphql'
import { graphqlSchemaFactory } from './graphqlSchema'
import {
    SequelizeFactory,
    S3Factory,
    LambdaFactory,
} from '@orderify/io'
import {
    FacebookGraph,
    FacebookOauth,
    PhotoLibraryOnFacebook,
    UserProfileOnFacebook,
    facebookAuthRouterFactory,
    photoLibraryGrapjQLMutationFactory,
} from '@orderify/facebook_integration'
import {
    MetadataFactory,
} from '@orderify/metadata_storage'
import {
    AlbumFactory,
    ImageFactory,
    ImageStorage,
    ImageLibraryReadGraphQLFactory,
    ImageLibraryApi,
} from '@orderify/image_library'
import {
    UserFactory,
    UserProfileReadGraphQLFactory,
    AccessTokenFactory,
    authGuardRouterFactory,
    Auth,
    JWT,
} from '@orderify/user_profile'
import { compareCampaignsServiceFactory } from '@orderify/compare_campaigns'
import { walletOperationsServiceFactory } from '@orderify/wallet_operations'

import { IAppConfig } from './config'

export async function appFactory(CONFIG: IAppConfig) {
    const sequelize = SequelizeFactory(CONFIG.DATABASE)
    const s3 = S3Factory(CONFIG.AWS)
    const lambda = LambdaFactory(CONFIG.AWS)

    const User = UserFactory(sequelize)
    const AccessToken = AccessTokenFactory(sequelize)
    const jwt = new JWT(CONFIG.TOKENS)
    const auth = new Auth(AccessToken, jwt)
    const authenticatedRouter = authGuardRouterFactory(auth)
    const userProfileReadGraphQL = UserProfileReadGraphQLFactory(User)

    const Metadata = MetadataFactory(sequelize)

    const Album = AlbumFactory(sequelize)
    const Image = ImageFactory(sequelize)
    const imageStorage = new ImageStorage(s3, lambda, CONFIG.STORAGE)
    const imageLibraryReadGraphQL = ImageLibraryReadGraphQLFactory(Album, Image, imageStorage)
    const imageLibratyApi = new ImageLibraryApi(Image)

    const OAUTH_REDIRECT_URL = `${CONFIG.API.PROTOCOL}://${CONFIG.API.HOST}:${CONFIG.API.PORT}/${CONFIG.FACEBOOK.OAUTH_REDIRECT_PATH}`
    const facebookOauth = new FacebookOauth(request, { ...CONFIG.FACEBOOK, OAUTH_REDIRECT_URL })
    const facebookGraph = new FacebookGraph(request)
    const userFacebook = new UserProfileOnFacebook(User, auth, Metadata, facebookGraph)
    const photoLibraryOnFacebook = new PhotoLibraryOnFacebook(
        Album,
        Image,
        Metadata,
        imageStorage,
        facebookGraph,
    )
    const photoLibraryGrapjQLMutation = photoLibraryGrapjQLMutationFactory(photoLibraryOnFacebook, Metadata)
    const facebookLoginRouter = facebookAuthRouterFactory(
        CONFIG.FACEBOOK,
        userFacebook,
        facebookOauth,
        auth,
    )

    const { walletOperations, walletOperationsGraphql } = walletOperationsServiceFactory(sequelize)
    const { compareCampaignsGraphql } = compareCampaignsServiceFactory(sequelize, imageLibratyApi, walletOperations)

    const app = express()

    const graphqlSchema = graphqlSchemaFactory({
        query: {
            ...userProfileReadGraphQL,
            ...imageLibraryReadGraphQL,
            ...compareCampaignsGraphql.query,
            ...walletOperationsGraphql.query,
        },
        mutation: {
            ...compareCampaignsGraphql.mutation,
            ...photoLibraryGrapjQLMutation,
        },
    })

    app.use(facebookLoginRouter)
    app.use(authenticatedRouter)

    app.use('/', graphqlHTTP({
        schema: graphqlSchema,
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

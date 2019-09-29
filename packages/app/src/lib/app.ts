import express, { Router } from 'express'
import request from 'request-promise'
import graphqlHTTP from 'express-graphql'
import {
    GraphQLSchema,
    GraphQLObjectType,
} from 'graphql'

import { SequelizeFactory, S3Factory, LambdaFactory } from '@orderify/io'
import { facebookGraphFactory, facebookOauthFactory, PhotoLibraryOnFacebook, userFacebookFactory } from '@orderify/facebook_integration'
import { MetadataFactory } from '@orderify/metadata_storage'
import {
    AlbumFactory,
    ImageFactory,
    ImageStorage,
    ImageLibraryReadGraphQLFactory,
} from '@orderify/image_library'
import { UserFactory, UserProfileReadGraphQLFactory, AccessTokenFactory } from '@orderify/user_profile'
import { CampaignFactory, ComparisonFactory, CampaignInterfaceFactory } from '@orderify/compare_campaigns'

import { authenticatedRouterFactory } from './authGuardRouter'
import { facebookLoginRouterFactory } from './facebookRouter'

import { IAppConfig } from './config'

export function ioFactory(CONFIG: IAppConfig) {
    const sequelize = SequelizeFactory(CONFIG.DATABASE)
    const s3 = S3Factory(CONFIG.AWS)
    const lambda = LambdaFactory(CONFIG.AWS)

    return {
        sequelize,
        s3,
        lambda,
    }
}

export async function startup({ sequelize }: ReturnType<typeof ioFactory>, CONFIG: IAppConfig) {
    if (CONFIG.SEQUELIZE.SYNC_SCHEMAS) {
        await sequelize.sync({ force: !!CONFIG.SEQUELIZE.DROP_ON_SYNC })
    }
}

export function appFactory({ sequelize, s3, lambda }: ReturnType<typeof ioFactory>, CONFIG: IAppConfig) {
    const OAUTH_REDIRECT_URL = `${CONFIG.API.PROTOCOL}://${CONFIG.API.HOST}:${CONFIG.API.PORT}/${CONFIG.FACEBOOK.OAUTH_REDIRECT_PATH}`
    const facebookOauth = facebookOauthFactory(request, { ...CONFIG.FACEBOOK, OAUTH_REDIRECT_URL })
    const facebookGraph = facebookGraphFactory(request)

    const Metadata = MetadataFactory(sequelize)

    const Album = AlbumFactory(sequelize)
    const Image = ImageFactory(sequelize)
    const imageStorage = new ImageStorage(s3, lambda, CONFIG.STORAGE)
    const photoLibraryOnFacebook = new PhotoLibraryOnFacebook(
        Album,
        Image,
        Metadata,
        imageStorage,
        facebookGraph,
    )

    const User = UserFactory(sequelize)
    const AccessToken = AccessTokenFactory(sequelize)
    const userFacebook = userFacebookFactory(User, Metadata, facebookGraph)

    const facebookLoginRouter = facebookLoginRouterFactory(
        Router(),
        CONFIG.FACEBOOK,
        userFacebook,
        facebookOauth,
        photoLibraryOnFacebook,
        AccessToken,
    )
    const authenticatedRouter = authenticatedRouterFactory(Router(), AccessToken)

    const Campaign = CampaignFactory(sequelize)
    const Comparison = ComparisonFactory(sequelize)

    const campaignInterface = CampaignInterfaceFactory(Comparison, Campaign)
    const userProfileReadGraphQL = UserProfileReadGraphQLFactory(User)
    const imageLibraryReadGraphQL = ImageLibraryReadGraphQLFactory(Album, Image, imageStorage)

    const router = Router()

    const QueryRootType = new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
            ...userProfileReadGraphQL,
            ...imageLibraryReadGraphQL,
            ...campaignInterface.query,
        }),
    })

    const MutationRootType = new GraphQLObjectType({
        name: 'Mutation',
        fields: () => ({
            ...campaignInterface.mutation,
        }),
    })

    const AppSchema = new GraphQLSchema({
        query: QueryRootType,
        mutation: MutationRootType,
    })

    router.use(facebookLoginRouter)
    router.use(authenticatedRouter)

    router.use('/', graphqlHTTP({
        schema: AppSchema,
        graphiql: true,
    }))

    const app = express()

    app.use(router)

    app.use((err, req, res, next) => {
        // tslint:disable-next-line: no-console
        console.error(err.stack)
        res.status(500).end()
    })

    return app
}

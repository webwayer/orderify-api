import express, { Router } from 'express'
import request from 'request-promise'
import graphqlHTTP from 'express-graphql'
import {
    GraphQLSchema,
    GraphQLObjectType,
} from 'graphql'

import { SequelizeFactory, S3Factory, LambdaFactory } from '@orderify/io'
import {
    FacebookGraph,
    FacebookOauth,
    PhotoLibraryOnFacebook,
    UserProfileOnFacebook,
    facebookAuthRouterFactory,
    photoLibraryGrapjQLMutationFactory,
} from '@orderify/facebook_integration'
import { MetadataFactory } from '@orderify/metadata_storage'
import {
    AlbumFactory,
    ImageFactory,
    ImageStorage,
    ImageLibraryReadGraphQLFactory,
} from '@orderify/image_library'
import { UserFactory, UserProfileReadGraphQLFactory, AccessTokenFactory, authGuardRouterFactory, Auth, JWT } from '@orderify/user_profile'
import { CampaignFactory, ComparisonFactory, CampaignInterfaceFactory } from '@orderify/compare_campaigns'

import { IAppConfig } from './config'

export async function appFactory(CONFIG: IAppConfig) {
    const sequelize = SequelizeFactory(CONFIG.DATABASE)
    const s3 = S3Factory(CONFIG.AWS)
    const lambda = LambdaFactory(CONFIG.AWS)

    const OAUTH_REDIRECT_URL = `${CONFIG.API.PROTOCOL}://${CONFIG.API.HOST}:${CONFIG.API.PORT}/${CONFIG.FACEBOOK.OAUTH_REDIRECT_PATH}`
    const facebookOauth = new FacebookOauth(request, { ...CONFIG.FACEBOOK, OAUTH_REDIRECT_URL })
    const facebookGraph = new FacebookGraph(request)

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
    const jwt = new JWT(CONFIG.TOKENS)
    const auth = new Auth(AccessToken, jwt)
    const userFacebook = new UserProfileOnFacebook(User, auth, Metadata, facebookGraph)

    const authenticatedRouter = authGuardRouterFactory(auth)
    const facebookLoginRouter = facebookAuthRouterFactory(
        CONFIG.FACEBOOK,
        userFacebook,
        facebookOauth,
        auth,
    )

    const Campaign = CampaignFactory(sequelize)
    const Comparison = ComparisonFactory(sequelize)

    const campaignInterface = CampaignInterfaceFactory(Comparison, Campaign)
    const userProfileReadGraphQL = UserProfileReadGraphQLFactory(User)
    const imageLibraryReadGraphQL = ImageLibraryReadGraphQLFactory(Album, Image, imageStorage)
    const photoLibraryGrapjQLMutation = photoLibraryGrapjQLMutationFactory(photoLibraryOnFacebook, Metadata)

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
            ...photoLibraryGrapjQLMutation,
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

    if (CONFIG.SEQUELIZE.SYNC_SCHEMAS) {
        await sequelize.sync({ force: !!CONFIG.SEQUELIZE.DROP_ON_SYNC })
    }

    return app
}

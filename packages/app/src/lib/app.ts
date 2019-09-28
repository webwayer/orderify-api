import express, { Router } from 'express'
import request from 'request-promise'
import graphqlHTTP from 'express-graphql'
import {
    GraphQLSchema,
    GraphQLObjectType,
} from 'graphql'

import { sequelizeFactory } from '@orderify/io'
import { facebookGraphFactory, facebookOauthFactory, photoLibraryOnFacebookFactory, userFacebookFactory } from '@orderify/facebook_integration'
import { MetadataFactory } from '@orderify/metadata_storage'
import {
    AlbumFactory,
    ImageFactory,
    imageStorageFactory,
    ImageLibraryReadGraphQLFactory,
} from '@orderify/image_library'
import { UserFactory, UserProfileReadGraphQLFactory, AccessTokenFactory } from '@orderify/user_profile'
import { CampaignFactory, ComparisonFactory, CampaignInterfaceFactory } from '@orderify/compare_campaigns'

import { authenticatedRouterFactory } from './authGuardRouter'
import { facebookLoginRouterFactory } from './facebookRouter'

import { IAppConfig } from './config'

export async function appFactory(CONFIG: IAppConfig) {
    const sequelize = sequelizeFactory(CONFIG.DATABASE)

    const facebookOauth = facebookOauthFactory(request, { ...CONFIG.FACEBOOK, ...CONFIG.API })
    const facebookGraph = facebookGraphFactory(request)
    const Metadata = await MetadataFactory(sequelize)

    const Album = await AlbumFactory(sequelize)
    const Image = await ImageFactory(sequelize)
    const imageStorage = await imageStorageFactory(request, CONFIG.AWS)
    const photoLibraryOnFacebook = photoLibraryOnFacebookFactory(
        Album,
        Image,
        Metadata,
        imageStorage,
        facebookGraph,
    )

    const User = await UserFactory(sequelize)
    const AccessToken = await AccessTokenFactory(sequelize)
    const userFacebook = await userFacebookFactory(User, Metadata, facebookGraph)

    const facebookLoginRouter = facebookLoginRouterFactory(
        Router(),
        CONFIG.FACEBOOK,
        userFacebook,
        facebookOauth,
        photoLibraryOnFacebook,
        AccessToken,
    )
    const authenticatedRouter = authenticatedRouterFactory(Router(), AccessToken)

    const Campaign = await CampaignFactory(sequelize)
    const Comparison = await ComparisonFactory(sequelize)

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

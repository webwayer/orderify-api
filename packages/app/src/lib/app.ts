import express, { Router } from 'express'
import graphqlHTTP from 'express-graphql'
import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
} from 'graphql'

import { sequelizeFactory, requestPromiseFactory } from '@orderify/io'
import { facebookGraphFactory, facebookOauthFactory, photoLibraryOnFacebookFactory, userFacebookFactory } from '@orderify/facebook'
import { MetadataFactory } from '@orderify/metadata'
import {
    AlbumFactory,
    PhotoFactory,
    photoStorageFactory,
    PhotoLibraryInterfaceFactory,
} from '@orderify/photo_library'
import { UserFactory, UserInterfaceFactory, AccessTokenFactory } from '@orderify/user'
import { CampaignFactory, ComparisonFactory, CampaignInterfaceFactory } from '@orderify/campaign'

import { authenticatedRouterFactory } from './authGuardRouter'
import { facebookLoginRouterFactory } from './facebookRouter'

import { IAppConfig } from './config'

export async function appFactory(CONFIG: IAppConfig) {
    const request = requestPromiseFactory()
    const sequelize = sequelizeFactory(CONFIG.DATABASE)

    const facebookOauth = facebookOauthFactory(request, { ...CONFIG.FACEBOOK, ...CONFIG.API })
    const facebookGraph = facebookGraphFactory(request)
    const Metadata = await MetadataFactory(sequelize, CONFIG.SEQUELIZE)

    const Album = await AlbumFactory(sequelize, CONFIG.SEQUELIZE)
    const Photo = await PhotoFactory(sequelize, CONFIG.SEQUELIZE)
    const photoStorage = await photoStorageFactory(request, CONFIG.AWS)
    const photoLibraryOnFacebook = photoLibraryOnFacebookFactory(
        Album,
        Photo,
        Metadata,
        photoStorage,
        facebookGraph,
    )

    const User = await UserFactory(sequelize, CONFIG.SEQUELIZE)
    const AccessToken = await AccessTokenFactory(sequelize, CONFIG.SEQUELIZE)
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

    const Campaign = await CampaignFactory(sequelize, CONFIG.SEQUELIZE)
    const Comparison = await ComparisonFactory(sequelize, CONFIG.SEQUELIZE)

    const campaignInterface = CampaignInterfaceFactory(Comparison, Campaign)
    const userInterface = UserInterfaceFactory(User)
    const photoLibraryInterface = PhotoLibraryInterfaceFactory(Album, Photo, photoStorage)

    const router = Router()

    const QueryRootType = new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
            ...userInterface,
            ...photoLibraryInterface,
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

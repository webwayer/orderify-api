import express, { Router } from 'express'
import graphqlHTTP from 'express-graphql'
import {
    GraphQLSchema,
    GraphQLObjectType,
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
    const authenticatedRouter = authenticatedRouterFactory(Router(), CONFIG.WEB, AccessToken)

    const userInterface = UserInterfaceFactory(User)
    const photoLibraryInterface = PhotoLibraryInterfaceFactory(Album, Photo)

    const router = Router()

    const QueryRootType = new GraphQLObjectType({
        name: 'App',
        fields: () => ({
            ...userInterface,
            ...photoLibraryInterface,
        }),
    })

    const AppSchema = new GraphQLSchema({
        query: QueryRootType,
    })

    router.use(facebookLoginRouter)
    router.use(authenticatedRouter)

    router.use('/', graphqlHTTP({
        schema: AppSchema,
        rootValue: {},
        graphiql: true,
    }))

    const app = express()

    app.use(router)

    return app
}

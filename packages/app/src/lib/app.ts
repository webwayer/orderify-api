import express, { Router } from 'express'

import { pkgcloudFactory, sequelizeFactory, sequelizeSessionStoreFactory, requestPromiseFactory } from '@orderify/io'
import { MetadataFactory, facebookGraphFactory, facebookOauthFactory } from '@orderify/facebook'
import { AlbumFactory, PhotoFactory, photoLibraryFactory, photoLibraryOnFacebookFactory, photoStorageFactory } from '@orderify/photo_library'
import { UserFactory, userFacebookFactory } from '@orderify/user'

import { statefulRouterFactory } from './routers/stateful'
import { authenticatedRouterFactory } from './routers/stateful/authenticated'
import { photosRouterFactory } from './routers/stateful/authenticated/photos'
import { facebookLoginRouterFactory } from './routers/stateful/facebook'

import { IAppConfig } from './config'

export async function appFactory(CONFIG: IAppConfig) {
    const request = requestPromiseFactory()
    const sequelize = sequelizeFactory(CONFIG.DATABASE)
    const sessionStore = await sequelizeSessionStoreFactory(sequelize, CONFIG.SEQUELIZE)
    const storage = pkgcloudFactory()

    const facebookOauth = facebookOauthFactory(request, { ...CONFIG.FACEBOOK, ...CONFIG.API })
    const facebookGraph = facebookGraphFactory(request)
    const Metadata = await MetadataFactory(sequelize, CONFIG.SEQUELIZE)

    const Album = await AlbumFactory(sequelize, CONFIG.SEQUELIZE)
    const Photo = await PhotoFactory(sequelize, CONFIG.SEQUELIZE)
    const photoStorage = await photoStorageFactory(request, storage)
    const photoLibrary = photoLibraryFactory(Photo, Album)
    const photoLibraryOnFacebook = photoLibraryOnFacebookFactory(
        Album,
        Photo,
        Metadata,
        photoStorage,
        facebookGraph,
    )

    const User = await UserFactory(sequelize, CONFIG.SEQUELIZE)
    const userFacebook = await userFacebookFactory(User, Metadata, facebookGraph)

    const statefulRouter = statefulRouterFactory(Router(), sessionStore, CONFIG.SESSION)
    const facebookLoginRouter = facebookLoginRouterFactory(
        Router(),
        CONFIG.FACEBOOK,
        userFacebook,
        facebookOauth,
        photoLibraryOnFacebook,
    )
    const authenticatedRouter = authenticatedRouterFactory(Router(), CONFIG.WEB)
    const photosRouter = photosRouterFactory(Router(), photoStorage, photoLibrary)

    const router = Router()

    router.use(statefulRouter)
    router.use(facebookLoginRouter)
    router.use(authenticatedRouter)
    router.use(photosRouter)

    const app = express()

    app.use(router)

    return app
}

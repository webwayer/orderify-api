import * as express from 'express'

import { Router } from 'express'

import { appFactory } from './app'

import { sequelizeFactory } from '@orderify/io/src/lib/sequelizeFactory'
import { sequelizeSessionStoreFactory } from '@orderify/io/src/lib/sequelizeSessionStoreFactory'
import { pkgcloudFactory } from '@orderify/io/src/lib/pkgcloudFactory'
import { facebookOauthFactory } from '../facebook/facebookOauthFactory'
import { facebookGraphFactory } from '../facebook/facebookGraphFactory'
import * as request from 'request-promise'

import { statefulRouterFactory } from './routers/stateful'
import { facebookLoginRouterFactory } from './routers/stateful/facebook'
import { authenticatedRouterFactory } from './routers/stateful/authenticated'
import { photosRouterFactory } from './routers/stateful/authenticated/photos'

import { UserFactory } from '../user/_/User'
import { photoLibraryOnFacebookFactory } from '../photo_library/photoLibraryOnFacebook'
import { PhotoFactory } from '../photo_library/_/Photo'
import { AlbumFactory } from '../photo_library/_/Album'
import { userFacebookFactory } from '../user/userFacebook'
import { FacebookMetadataFactory } from '../facebook/_/FacebookMetadata'
import { photoStorageFactory } from '../photo_library/photoStorage'
import { photoLibraryFactory } from '../photo_library/photoLibrary'

async function startup() {
    const CONFIG = {
        DATABASE: {
            DIALECT: 'postgres',
            DATABASE_NAME: 'orderify',
            USER: '',
            PASSWORD: '',
            HOST: 'localhost',
            PORT: '5432',
        },
        SEQUELIZE: {
            SYNC_SCHEMAS: '1',
            DROP_ON_SYNC: '',
        },
        SESSION: {
            SIGNING_SECRET: 'something',
            HTTPS_ONLY_COOKIES: '1',
        },
        FACEBOOK: {
            CLIENT_ID: '',
            CLIENT_SECRET: '',
            REDIRECT_PATH: '/login/facebook/callback'
        },
        API: {
            HOST: 'localhost',
            PORT: '3000',
            PROTOCOL: 'http',
        },
        WEB: {
            BASE_URL: 'http://localhost:3000'
        }
    }

    for (const [key, value] of Object.entries(process.env)) {
        const config_bundle = key.split('_')[0]
        const config_name = key.split('_').splice(1).join('_')

        if (CONFIG[config_bundle]) {
            CONFIG[config_bundle][config_name] = value
        }
    }

    const sequelize = sequelizeFactory(CONFIG.DATABASE)
    const sessionStore = await sequelizeSessionStoreFactory(sequelize, CONFIG.SEQUELIZE)
    const storage = pkgcloudFactory()

    const facebookOauth = facebookOauthFactory(request, Object.assign({}, CONFIG.FACEBOOK, CONFIG.API))
    const facebookGraph = facebookGraphFactory(request)
    const FacebookMetadata = await FacebookMetadataFactory(sequelize, CONFIG.SEQUELIZE)

    const Album = await AlbumFactory(sequelize, CONFIG.SEQUELIZE)
    const Photo = await PhotoFactory(sequelize, CONFIG.SEQUELIZE)
    const photoStorage = await photoStorageFactory(request, storage)
    const photoLibrary = photoLibraryFactory(Photo, Album)
    const photoLibraryOnFacebook = photoLibraryOnFacebookFactory(Album, Photo, FacebookMetadata, photoStorage, facebookGraph)

    const User = await UserFactory(sequelize, CONFIG.SEQUELIZE)
    const userFacebook = await userFacebookFactory(User, FacebookMetadata, facebookGraph)

    const statefulRouter = statefulRouterFactory(Router(), sessionStore, CONFIG.SESSION)
    const facebookLoginRouter = facebookLoginRouterFactory(Router(), CONFIG.FACEBOOK, userFacebook, facebookOauth, photoLibraryOnFacebook)
    const authenticatedRouter = authenticatedRouterFactory(Router(), CONFIG.WEB)
    const photosRouter = photosRouterFactory(Router(), photoStorage, photoLibrary)

    const router = Router();

    router.use(statefulRouter)
    router.use(facebookLoginRouter)
    router.use(authenticatedRouter)
    router.use(photosRouter)

    const app = express()

    app.use(router)

    return await appFactory(app, CONFIG.API);
}

if (!module.parent) {
    startup().catch(console.error).then(() => {
        console.log('ready')
    })
}
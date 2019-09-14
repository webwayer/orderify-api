import * as express from 'express'

import { Router } from 'express'

import { appFactory } from 'app'

import { sequelizeFactory } from 'io/sequelizeFactory'
import { sequelizeSessionStoreFactory } from 'io/sequelizeSessionStoreFactory'
import { pkgcloudFactory } from 'io/pkgcloudFactory'
import { facebookOauthFactory } from 'facebook/facebookOauthFactory'
import { facebookGraphFactory } from 'facebook/facebookGraphFactory'
import * as request from 'request-promise'

import { statefulRouterFactory } from 'routers/stateful'
import { facebookLoginRouterFactory } from 'routers/stateful/facebook'
import { authenticatedRouterFactory } from 'routers/stateful/authenticated'
import { photosRouterFactory } from 'routers/stateful/authenticated/photos'

import { UserFactory } from 'user/_/User'
import { photoLibraryOnFacebookFactory } from 'photoLibrary/photoLibraryOnFacebook'
import { PhotoFactory } from 'photoLibrary/_/Photo'
import { AlbumFactory } from 'photoLibrary/_/Album'
import { userFacebookFactory } from 'user/userFacebook'
import { FacebookMetadataFactory } from 'facebook/_/FacebookMetadata'

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
    const photoLibraryOnFacebook = photoLibraryOnFacebookFactory(request, storage, Album, Photo, facebookGraph)

    const User = await UserFactory(sequelize, CONFIG.SEQUELIZE)
    const userFacebook = await userFacebookFactory(User, FacebookMetadata, facebookGraph)

    const statefulRouter = statefulRouterFactory(Router(), sessionStore, CONFIG.SESSION)
    const authenticatedRouter = authenticatedRouterFactory(Router(), CONFIG.WEB)
    const facebookLoginRouter = facebookLoginRouterFactory(Router(), CONFIG.FACEBOOK, userFacebook, facebookOauth, photoLibraryOnFacebook)
    const photosRouter = photosRouterFactory(Router(), Album, Photo, storage)

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
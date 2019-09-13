import * as express from 'express'
import { Router } from 'express'

import { appFactory } from 'app'

import { sequelizeFactory } from 'factory/sequelizeFactory'
import { sequelizeSessionStoreFactory } from 'factory/sequelizeSessionStoreFactory'
import { pkgCloudFileStorageFactory } from 'factory/pkgCloudFilesStorageFactory'

import { statefulRouterFactory } from 'routers/stateful'
import { facebookLoginRouterFactory } from 'routers/stateful/facebook'
import { authenticatedRouterFactory } from 'routers/stateful/authenticated'
import { photosRouterFactory } from 'routers/stateful/authenticated/photos'

import { UserFactory } from 'database/User'
import { PhotoFactory } from 'database/Photo'
import { AlbumFactory } from 'database/Album'

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
        },
        API: {
            HOST: 'localhost',
            PORT: '3000',
            PROTOCOL: 'https',
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
    const storage = pkgCloudFileStorageFactory()

    const User = await UserFactory(sequelize, CONFIG.SEQUELIZE)
    const Album = await AlbumFactory(sequelize, CONFIG.SEQUELIZE)
    const Photo = await PhotoFactory(sequelize, CONFIG.SEQUELIZE)

    const sessionStore = await sequelizeSessionStoreFactory(sequelize, CONFIG.SEQUELIZE)

    const statefulRouter = statefulRouterFactory(Router(), sessionStore, CONFIG.SESSION)
    const authenticatedRouter = authenticatedRouterFactory(Router(), CONFIG.WEB)
    const facebookLoginRouter = facebookLoginRouterFactory(Router(), Object.assign({}, CONFIG.FACEBOOK, CONFIG.API), User, Album, Photo, storage)
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
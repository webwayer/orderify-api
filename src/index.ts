import * as express from 'express'
import { Router } from 'express'

import { appFactory } from 'app'

import { sequelizeFactory } from 'factory/sequelizeFactory'
import { sequelizeSessionStoreFactory } from 'factory/sequelizeSessionStoreFactory'

import { statefulRouterFactory } from 'routers/stateful'
import { authenticatedRouterFactory } from 'routers/stateful/authenticated'
import { facebookLoginRouterFactory } from 'routers/stateful/authenticated/facebook'
import { photosRouterFactory } from 'routers/stateful/authenticated/photos'

import { UserFactory } from 'database/User'
import { PhotoFactory } from 'database/Photo'
import { AlbumFactory } from 'database/Album'

async function startup() {
    const config = {
        PG_DB_NAME: 'orderify',
        PG_USER: '',
        PG_PASSWORD: '',
        PG_HOST: 'localhost',
        PG_PORT: '5432',
        SYNC_SEQUELIZE_MODELS: '1',
        FACEBOOK_CLIENT_ID: '',
        FACEBOOK_CLIENT_SECRET: '',
        BASE_URL: 'http://localhost:3000',
        WEB_BASE_URL: 'http://localhost:3000',
    }

    for (const key of Object.keys(process.env)) {
        config[key] = process.env[key]
    }

    const sequelize = sequelizeFactory(config)

    const User = await UserFactory(sequelize, config)
    const Album = await AlbumFactory(sequelize, config)
    const Photo = await PhotoFactory(sequelize, config)

    const sessionStore = await sequelizeSessionStoreFactory(sequelize, config)

    const statefulRouter = statefulRouterFactory(Router(), sessionStore)
    const authenticatedRouter = authenticatedRouterFactory(Router(), config)
    const facebookLoginRouter = facebookLoginRouterFactory(Router(), config, User, Album, Photo)
    const photosRouter = photosRouterFactory(Router(), Album, Photo)

    const router = Router();

    router.use(statefulRouter)
    router.use(facebookLoginRouter)
    router.use(authenticatedRouter)
    router.use(photosRouter)

    const app = express()

    app.use(router)

    return await appFactory(app, config);
}

if (!module.parent) {
    startup().catch(console.error).then(() => {
        console.log('ready')
    })
}
import * as express from 'express'
import { Router } from 'express'

import { sequelizeFactory } from 'sequelizeFactory'
import { sequelizeSessionStoreFactory } from 'sequelizeSessionStoreFactory'
import { passportFactory } from 'passportFactory'

import { statefulRouterFactory } from './routes/stateful'
import { authenticatedRouterFactory } from './routes/stateful/authenticated'
import { photosRouterFactory } from './routes/stateful/authenticated/photos'

import { UserFactory } from 'User';
import { AlbumFactory } from 'Album';

export async function appFactory(router: Router) {
    const app = express()

    app.use(router)

    await new Promise((resolve, reject) => {
        app.listen(3000, err => {
            if (err) {
                reject(err)
            }
            resolve()
        })
    })

    return app
}

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
        FACEBOOK_CALLBACK_URL: 'http://localhost:3000/auth/facebook/callback'
    }

    for (const key of Object.keys(process.env)) {
        config[key] = process.env[key]
    }

    const sequelize = sequelizeFactory(config)
    const User = await UserFactory(sequelize, config)
    const Album = await AlbumFactory(sequelize, config)

    const sessionStore = await sequelizeSessionStoreFactory(sequelize, config)
    const passport = passportFactory(config, User)

    const statefulRouter = statefulRouterFactory(sessionStore)
    const authenticatedRouter = authenticatedRouterFactory(passport)
    const photosRouter = photosRouterFactory()

    const router = Router();

    router.use(statefulRouter)
    router.use(authenticatedRouter)
    router.use(photosRouter)

    const app = await appFactory(router);
}

if (!module.parent) {
    startup().catch(console.error).then(() => {
        console.log('ready')
    })
}
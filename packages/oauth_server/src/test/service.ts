import express from 'express'

import { SequelizeFactory, IO_CONFIG } from '@orderify/io'

import { oauthServerServiceFactory, OAUTH_SERVER_CONFIG } from '..'

export const sequelize = SequelizeFactory(IO_CONFIG.DATABASE)
export const {
    AccessToken,
    PKCECode,
    auth,
    pkce,
    jwtAccessToken,
    authGuardRouter,
} = oauthServerServiceFactory(OAUTH_SERVER_CONFIG, sequelize)

export const app = express()
app.use(authGuardRouter)
app.use((err, req, res, next) => {
    res.sendStatus(500)
})

import express from 'express'

import { SequelizeFactory, IO_CONFIG, updateConfig } from '@orderify/io'

import { oauthServerServiceFactory, OAUTH_SERVER_CONFIG } from '..'

export const sequelize = SequelizeFactory(updateConfig(IO_CONFIG, process.env).DATABASE)
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

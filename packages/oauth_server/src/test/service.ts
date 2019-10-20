import dotenv from 'dotenv'
dotenv.config()

import { SequelizeFactory, updateConfig, IO_CONFIG } from '@orderify/io'

import { oauthServerServiceFactory, OAUTH_SERVER_CONFIG } from '..'

export const sequelize = SequelizeFactory(updateConfig(IO_CONFIG, process.env).DATABASE)

export const {
    AccessToken,
    PKCECode,
    auth,
    pkce,
    jwtAccessToken,
} = oauthServerServiceFactory(OAUTH_SERVER_CONFIG, sequelize)

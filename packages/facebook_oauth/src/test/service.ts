import request from 'request-promise'
import express from 'express'

import { facebookOauthServiceFactory } from '..'

import { SequelizeFactory, IO_CONFIG, updateConfig } from '@orderify/io'

// sha256 from `code_verifier_string`
export const code_challenge = 'b1794757a33814aabb551136200573b1aa29bd5f67e7ef8324cbb6850c082cec'
export const code_verifier = 'code_verifier_string'

import { oauthServerServiceFactory, OAUTH_SERVER_CONFIG } from '@orderify/oauth_server'
import { userProfileServiceFactory } from '@orderify/user_profile'
import { metadataStorageServiceFactory } from '@orderify/metadata_storage'

export const sequelize = SequelizeFactory(updateConfig(IO_CONFIG, process.env).DATABASE)

export const { auth, pkce, jwtAccessToken } = oauthServerServiceFactory(OAUTH_SERVER_CONFIG, sequelize)
export const { usersMetadataStorage } = metadataStorageServiceFactory(sequelize)
export const { userProfile } = userProfileServiceFactory(sequelize)

export const { facebookOauthRouter } = facebookOauthServiceFactory(
    IO_CONFIG.API,
    IO_CONFIG.WEB,
    {
        CLIENT_ID: 'test_client_id',
        CLIENT_SECRET: 'test_client_secret',
    },
    request, usersMetadataStorage, userProfile, auth, pkce, jwtAccessToken)

export const app = express()
app.use('/auth/facebook', facebookOauthRouter)
app.use((err, req, res, next) => {
    res.status(500).send(err)
})

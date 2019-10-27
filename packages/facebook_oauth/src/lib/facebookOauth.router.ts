import { Router } from 'express'

import { IO_CONFIG } from '@orderify/io'
import { FACEBOOK_OAUTH_CONFIG } from '../config'
import { FacebookOauth } from './_/_/FacebookOauth'
import { UserProfileOnFacebook } from './_/UserProfileOnFacebook'
import { PKCE, Auth, JWTAccessToken } from '@orderify/oauth_server'

export function facebookAuthRouterFactory(
    CONFIG_API: typeof IO_CONFIG.API,
    CONFIG_OAUTH: typeof FACEBOOK_OAUTH_CONFIG.OAUTH,
    userProfileOnFacebook: UserProfileOnFacebook,
    facebookOauth: FacebookOauth,
    auth: Auth,
    pkce: PKCE,
    jwtAccessToken: JWTAccessToken,
) {
    const router = Router()

    router.get('/', (req, res, next) => {
        try {
            const { code_challenge, code_challenge_method, redirect_uri, state, dev_email } = req.query

            if (code_challenge?.length !== 64) {
                throw new Error('code_challenge shouldnt be empty but sha256 of code_verifier (64 chars)')
            }

            if (code_challenge_method !== 'S256') {
                throw new Error('code_challenge_method shouldnt be empty but `S256`')
            }

            if (!CONFIG_OAUTH.REDIRECT_URIS.split(',').includes(redirect_uri)) {
                throw new Error('unregistered or empty redirect_uri')
            }

            if (state && state.length > 256) {
                throw new Error('state length is limited to 256 chars')
            }

            const facebookLoginUrl = facebookOauth.generateStartOauthUrl({
                redirect_uri: `${CONFIG_API.PROTOCOL}://${CONFIG_API.HOST}:${CONFIG_API.PORT}${req.originalUrl.split('?')[0]}/callback`,
                scope: 'email,user_photos',
                response_type: 'code,granted_scopes',
                state: Buffer.from(JSON.stringify({
                    code_challenge,
                    redirect_uri,
                    state,
                    dev_email,
                }), 'utf8').toString('base64'),
            })

            res.redirect(facebookLoginUrl)
        } catch (err) {
            next(err)
        }
    })

    router.get(`/callback`, async (req, res, next) => {
        try {
            const { code, granted_scopes, denied_scopes, state, error_reason, error, error_description } = req.query

            if (code) {
                const { access_token, expires_in, token_type } = await facebookOauth.exchangeCodeForAcessToken(
                    code,
                    `${CONFIG_API.PROTOCOL}://${CONFIG_API.HOST}:${CONFIG_API.PORT}${req.originalUrl.split('?')[0]}`,
                )

                const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf8'))

                if (access_token) {
                    const accessData = {
                        access_token,
                        expires_in,
                        token_type,
                        granted_scopes,
                        denied_scopes,
                    }

                    const user = await userProfileOnFacebook.createOrUpdate(accessData, decodedState.dev_email)
                    const pkceCode = await pkce.start(user.id, decodedState.code_challenge)

                    res.redirect(`${decodedState.redirect_uri}#code=${pkceCode}&state=${decodedState.state || ''}`)
                }
            }
        } catch (err) {
            next(err)
        }
    })

    router.get(`/exchangeCode`, async (req, res, next) => {
        try {
            const { code, code_verifier } = req.query

            if (!code || !code_verifier) {
                throw new Error('code & code_verifier should be empty')
            }

            const userId = await pkce.verify(code, code_verifier)
            const accessToken = await auth.logIn(userId)
            const token = await jwtAccessToken.create(accessToken)

            res.json({ token })
        } catch (err) {
            next(err)
        }
    })

    return router
}

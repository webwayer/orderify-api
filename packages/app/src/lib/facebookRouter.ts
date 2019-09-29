import { Router } from 'express'

import { IFacebookOauth, PhotoLibraryOnFacebook, UserProfileOnFacebook } from '@orderify/facebook_integration'
import { IAccessTokenStatic, createToken } from '@orderify/user_profile'

export function facebookLoginRouterFactory(
    router: Router,
    CONFIG: { OAUTH_REDIRECT_PATH: string },
    userProfileOnFacebook: UserProfileOnFacebook,
    facebookOauth: IFacebookOauth,
) {
    router.get('/login/facebook', (req, res) => {
        const facebookLoginUrl = facebookOauth.generateStartOauthUrl({
            scope: 'email,user_photos',
            response_type: 'code,granted_scopes',
        })

        res.redirect(facebookLoginUrl)
    })

    router.get(`/${CONFIG.OAUTH_REDIRECT_PATH}`, async (req, res, next) => {
        try {
            const { code, granted_scopes, denied_scopes, state, error_reason, error, error_description } = req.query

            if (code) {
                const { access_token, expires_in, token_type } = await facebookOauth.exchangeCodeForAcessToken(code)

                if (access_token) {
                    const accessData = {
                        access_token,
                        expires_in,
                        token_type,
                        granted_scopes,
                        denied_scopes,
                    }

                    const accessToken = await userProfileOnFacebook.findByAccessToken(access_token) ?
                        await userProfileOnFacebook.signIn(accessData) :
                        await userProfileOnFacebook.signUp(accessData)

                    const tokenRaw = createToken({
                        id: accessToken.id,
                        uid: accessToken.userId,
                    })

                    res.redirect(`/?token=${tokenRaw}`)
                }
            }
        } catch (err) {
            next(err)
        }
    })

    return router
}

import { Router } from 'express'

import { facebookOauthFactory, photoLibraryOnFacebookFactory, userFacebookFactory } from '@orderify/facebook'
import { IAccessTokenStatic, createToken } from '@orderify/user'

export function facebookLoginRouterFactory(
    router: Router,
    CONFIG: { REDIRECT_PATH: string },
    userFacebook: ReturnType<typeof userFacebookFactory>,
    facebookOauth: ReturnType<typeof facebookOauthFactory>,
    photoLibraryOnFacebook: ReturnType<typeof photoLibraryOnFacebookFactory>,
    AccessToken: IAccessTokenStatic,
) {
    router.get('/login/facebook', (req, res) => {
        const queryParams = {
            scope: 'email,user_photos',
            response_type: 'code,granted_scopes',
        }

        const facebookLoginUrl = facebookOauth.generateStartOauthUrl(queryParams)

        res.redirect(facebookLoginUrl)
    })

    router.get(`/${CONFIG.REDIRECT_PATH}`, (req, res) => {
        (async () => {
            const { code, granted_scopes, denied_scopes, state, error_reason, error, error_description } = req.query

            if (code) {
                const { access_token, expires_in, token_type } = await facebookOauth.exchangeCodeForAcessToken(code)

                const accessData = {
                    access_token,
                    expires_in,
                    token_type,
                    granted_scopes,
                    denied_scopes,
                }

                if (access_token) {
                    let user = await userFacebook.findByFacebookAccessToken(access_token)
                    if (!user) {
                        user = await userFacebook.createFromFacebook(accessData)

                        await photoLibraryOnFacebook.download(user.id, access_token)
                    } else {
                        await userFacebook.updateMetadata(user.id, accessData)
                    }

                    await AccessToken.create({
                        userId: user.id,
                    })
                    const tokenRaw = createToken({
                        id: 1,
                        uid: user.id,
                    })

                    return tokenRaw
                }
            }
        })().then((tokenRaw) => {
            res.redirect(`/login?token=${tokenRaw}`)
        }).catch((err) => {
            throw err
        })
    })

    return router
}

import { Sequelize } from 'sequelize'

import {
    AccessTokenFactory,
    PKCECodeFactory,
    Auth,
    PKCE,
    JWTAccessToken,
    authGuardRouterFactory,
    OAUTH_SERVER_CONFIG,
} from './'

export function oauthServerServiceFactory(
    CONFIG: typeof OAUTH_SERVER_CONFIG,
    sequelize: Sequelize,
) {
    const AccessToken = AccessTokenFactory(sequelize)
    const PKCECode = PKCECodeFactory(sequelize)

    const auth = new Auth(CONFIG.ACCESSTOKEN, AccessToken)
    const pkce = new PKCE(CONFIG.PKCECODE, PKCECode)
    const jwtAccessToken = new JWTAccessToken(CONFIG.JWT)

    const authGuardRouter = authGuardRouterFactory(auth, jwtAccessToken)

    return { AccessToken, PKCECode, auth, pkce, jwtAccessToken, authGuardRouter }
}

import { Sequelize } from 'sequelize'

import {
    UserFactory,
    AccessTokenFactory,
    JWT,
    Auth,
    authGuardRouterFactory,
    UserProfileGraphQLFactory,
} from './'

export function userProfileServiceFactory(
    sequelize: Sequelize,
    CONFIG: any,
) {
    const User = UserFactory(sequelize)
    const AccessToken = AccessTokenFactory(sequelize)
    const jwt = new JWT(CONFIG.TOKENS)
    const auth = new Auth(User, AccessToken, jwt)
    const authenticatedRouter = authGuardRouterFactory(auth)
    const userProfileGraphql = UserProfileGraphQLFactory(User)

    return { User, AccessToken, jwt, auth, authenticatedRouter, userProfileGraphql }
}

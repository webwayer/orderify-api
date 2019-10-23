import { RequestPromiseAPI } from 'request-promise'

import { IO_CONFIG } from '@orderify/io'
import { Auth, PKCE, JWTAccessToken } from '@orderify/oauth_server'
import { MetadataStorage } from '@orderify/metadata_storage'
import { UserProfile } from '@orderify/user_profile'

import {
    FacebookGraph,
    FacebookOauth,
    UserProfileOnFacebook,
    facebookAuthRouterFactory,
    FACEBOOK_OAUTH_CONFIG,
} from '.'

export function facebookOauthServiceFactory(
    API_CONFIG: typeof IO_CONFIG.API,
    OAUTH_CONFIG: typeof FACEBOOK_OAUTH_CONFIG.OAUTH,
    FACEBOOK_CONFIG: typeof FACEBOOK_OAUTH_CONFIG.FACEBOOK,
    request: RequestPromiseAPI,
    userMetadataStorage: MetadataStorage,
    userProfile: UserProfile,
    auth: Auth,
    pkce: PKCE,
    jwtAccessToken: JWTAccessToken,
) {
    const facebookOauth = new FacebookOauth(request, FACEBOOK_CONFIG)
    const facebookGraph = new FacebookGraph(request)

    const userProfileOnFacebook = new UserProfileOnFacebook(userProfile, facebookGraph, userMetadataStorage)

    const facebookOauthRouter = facebookAuthRouterFactory(
        API_CONFIG,
        OAUTH_CONFIG,
        userProfileOnFacebook,
        facebookOauth,
        auth,
        pkce,
        jwtAccessToken,
    )

    return { facebookOauth, facebookGraph, userProfileOnFacebook, facebookOauthRouter }
}

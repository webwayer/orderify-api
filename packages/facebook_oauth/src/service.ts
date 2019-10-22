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
    WEB_CONFIG: typeof IO_CONFIG.WEB,
    FACEBOOK_CONFIG: typeof FACEBOOK_OAUTH_CONFIG,
    request: RequestPromiseAPI,
    metadataStorage: MetadataStorage,
    userProfile: UserProfile,
    auth: Auth,
    pkce: PKCE,
    jwtAccessToken: JWTAccessToken,
) {
    const facebookOauth = new FacebookOauth(request, FACEBOOK_CONFIG)
    const facebookGraph = new FacebookGraph(request)

    const userProfileOnFacebook = new UserProfileOnFacebook(userProfile, facebookGraph, metadataStorage)

    const facebookOauthRouter = facebookAuthRouterFactory(
        API_CONFIG,
        WEB_CONFIG,
        userProfileOnFacebook,
        facebookOauth,
        auth,
        pkce,
        jwtAccessToken,
    )

    return { facebookOauth, facebookGraph, userProfileOnFacebook, facebookOauthRouter }
}

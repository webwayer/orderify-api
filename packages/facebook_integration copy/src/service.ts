import {
    FacebookGraph,
    FacebookOauth,
    UserProfileOnFacebook,
    PhotoLibraryOnFacebook,
    photoLibraryOnFacebookGraphqlFactory,
    facebookAuthRouterFactory,
    FACEBOOK_INTEGRATION_CONFIG,
} from './'
import { RequestPromiseAPI } from 'request-promise'
import { Auth } from '@orderify/user_profile'
import { ImageStorage, IImageLibrary } from '@orderify/image_library'
import { MetadataStorage } from '@orderify/metadata_storage'

export function facebookIntegrationServiceFactory(
    CONFIG: typeof FACEBOOK_INTEGRATION_CONFIG,
    request: RequestPromiseAPI,
    imageLibrary: IImageLibrary,
    imageStorage: ImageStorage,
    metadataStorage: MetadataStorage,
    auth: Auth,
) {
    const OAUTH_REDIRECT_URL = `${CONFIG.API.PROTOCOL}://${CONFIG.API.HOST}:${CONFIG.API.PORT}/${CONFIG.FACEBOOK.OAUTH_REDIRECT_PATH}`
    const facebookOauth = new FacebookOauth(request, { ...CONFIG.FACEBOOK, OAUTH_REDIRECT_URL })
    const facebookGraph = new FacebookGraph(request)
    const userProfileOnFacebook = new UserProfileOnFacebook(auth, metadataStorage, facebookGraph)
    const photoLibraryOnFacebook = new PhotoLibraryOnFacebook(
        imageLibrary,
        imageStorage,
        metadataStorage,
        facebookGraph,
    )
    const photoLibraryOnFacebookGraphql = photoLibraryOnFacebookGraphqlFactory(
        photoLibraryOnFacebook,
        userProfileOnFacebook,
    )
    const facebookLoginRouter = facebookAuthRouterFactory(
        CONFIG.FACEBOOK,
        userProfileOnFacebook,
        facebookOauth,
    )

    return { facebookLoginRouter, photoLibraryOnFacebookGraphql }
}

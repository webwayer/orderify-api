import {
    FacebookGraph,
    FacebookOauth,
    UserProfileOnFacebook,
    PhotoLibraryOnFacebook,
    photoLibraryGrapjQLMutationFactory,
    facebookAuthRouterFactory,
} from './'
import { RequestPromiseAPI } from 'request-promise'
import { IUser, Auth } from '@orderify/user_profile'
import { IAlbum, IImage, ImageStorage } from '@orderify/image_library'
import { IMetadata } from '@orderify/metadata_storage'

export function facebookIntegrationServiceFactory(
    request: RequestPromiseAPI,
    User: IUser,
    Album: IAlbum,
    Image: IImage,
    Metadata: IMetadata,
    auth: Auth,
    imageStorage: ImageStorage,
    CONFIG: any,
) {
    const OAUTH_REDIRECT_URL = `${CONFIG.API.PROTOCOL}://${CONFIG.API.HOST}:${CONFIG.API.PORT}/${CONFIG.FACEBOOK.OAUTH_REDIRECT_PATH}`
    const facebookOauth = new FacebookOauth(request, { ...CONFIG.FACEBOOK, OAUTH_REDIRECT_URL })
    const facebookGraph = new FacebookGraph(request)
    const userFacebook = new UserProfileOnFacebook(User, auth, Metadata, facebookGraph)
    const photoLibraryOnFacebook = new PhotoLibraryOnFacebook(
        Album,
        Image,
        Metadata,
        imageStorage,
        facebookGraph,
    )
    const photoLibraryGrapjQLMutation = photoLibraryGrapjQLMutationFactory(photoLibraryOnFacebook, Metadata)
    const facebookLoginRouter = facebookAuthRouterFactory(
        CONFIG.FACEBOOK,
        userFacebook,
        facebookOauth,
        auth,
    )

    return { facebookLoginRouter, photoLibraryGrapjQLMutation }
}

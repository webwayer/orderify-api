import {
    PhotoLibraryOnFacebook,
    photoLibraryOnFacebookGraphqlFactory,
} from '../src'

import { ImageStorage, IImageLibrary } from '@orderify/image_library'
import { MetadataStorage } from '@orderify/metadata_storage'
import { FacebookGraph, IUserProfileOnFacebook } from '@orderify/facebook_oauth'

export function facebookPhotosServiceFactory(
    imageLibrary: IImageLibrary,
    imageStorage: ImageStorage,
    imagesMetadataStorage: MetadataStorage,
    albumsMetadataStorage: MetadataStorage,
    facebookGraph: FacebookGraph,
    userProfileOnFacebook: IUserProfileOnFacebook,
) {
    const photoLibraryOnFacebook = new PhotoLibraryOnFacebook(
        imageLibrary,
        imageStorage,
        imagesMetadataStorage,
        albumsMetadataStorage,
        facebookGraph,
    )
    const photoLibraryOnFacebookGraphql = photoLibraryOnFacebookGraphqlFactory(
        photoLibraryOnFacebook,
        userProfileOnFacebook,
    )

    return { photoLibraryOnFacebook, photoLibraryOnFacebookGraphql }
}

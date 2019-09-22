import { IMetadataStatic, facebookGraphFactory } from '@orderify/facebook'

import { IAlbumStatic } from './Album'
import { IPhotoStatic } from './Photo'
import { photoStorageFactory } from './photoStorage'

export function photoLibraryOnFacebookFactory(
    Album: IAlbumStatic,
    Photo: IPhotoStatic,
    Metadata: IMetadataStatic,
    photoStorage: ReturnType<typeof photoStorageFactory>,
    facebookGraph: ReturnType<typeof facebookGraphFactory>,
) {
    async function download(userId: number, access_token: string) {
        const albums = await facebookGraph.makeRequest(access_token, 'me', 'albums', {
            limit: 1000,
            fields: 'name,type,created_time,updated_time',
        })

        const albumsToSave = []
        const photosToSave = []

        for (const album of albums) {
            if (album.type === 'profile') {
                albumsToSave.push(album)
                photosToSave.push(await facebookGraph.makeRequest(access_token, album.id, 'photos', {
                    limit: 1000,
                    fields: 'name,alt_text,images,created_time,updated_time,album',
                }))
            }
        }

        const ourAlbums = await Album.bulkCreate(albumsToSave.map((album) => {
            return {
                name: album.name,
                userId,
            }
        }))

        const ourPhotosToSaveProps = photosToSave.map((photosCollection, photosCollectionIndex) => {
            return photosCollection.map((photo) => {
                const album = ourAlbums[photosCollectionIndex]
                const image = photo.images.find((image2) => image2.width + image2.height < 2000)

                return {
                    name: photo.name,
                    alt_text: photo.alt_text,
                    userId,
                    albumId: album.id,
                    link: image.source,
                    width: image.width,
                    height: image.height,
                }
            })
        })
        const ourPhotos = await Photo.bulkCreate([].concat(...ourPhotosToSaveProps))

        await Metadata.bulkCreate(albumsToSave.map((album, albumIndex) => {
            return {
                sourceId: ourAlbums[albumIndex].id,
                sourceType: 'FACEBOOK.ALBUM',
                data: { album },
            }
        }))

        await Metadata.bulkCreate([].concat(...photosToSave).map((photo, photoIndex) => {
            return {
                sourceId: ourPhotos[photoIndex].id,
                sourceType: 'FACEBOOK.PHOTO',
                data: { photo },
            }
        }))

        // Should be awaited some time
        Promise.all(ourPhotos.map((ourPhoto) => photoStorage.uploadFromUrl(ourPhoto.id, ourPhoto.link)))
    }

    return {
        download,
    }
}

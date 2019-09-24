import { IFacebookGraph } from './facebookGraphFactory'
import { IMetadataStatic } from '@orderify/metadata'
import { IAlbumStatic, IPhotoStatic, IImageStorage } from '@orderify/photo_library'
import { newId } from '@orderify/io'

export function photoLibraryOnFacebookFactory(
    Album: IAlbumStatic,
    Photo: IPhotoStatic,
    Metadata: IMetadataStatic,
    photoStorage: IImageStorage,
    facebookGraph: IFacebookGraph,
) {
    async function download(userId: string, access_token: string) {
        // LOAD FROM FACEBOOK

        const FBALLalbums = await facebookGraph.makeRequest(access_token, 'me', 'albums', {
            limit: 1000,
            fields: 'name,type,created_time,updated_time',
        })

        const FBalbumsToSave = FBALLalbums.filter((album) => album.type === 'profile')
        const FBphotosToSave = await Promise.all<any[]>(FBalbumsToSave.map((album) => {
            return facebookGraph.makeRequest(access_token, album.id, 'photos', {
                limit: 1000,
                fields: 'name,alt_text,images,created_time,updated_time,album',
            })
        }))

        // PREPARE DATA

        const ourUrlsToUpload = []
        const ourMetadataToSave = []
        const ourAlbumsToSave = FBalbumsToSave.map((album) => {
            return {
                id: newId(),
                name: album.name,
                userId,
            }
        })
        const ourPhotosToSave = FBphotosToSave.map((photosCollection, photosCollectionIndex) => {
            return photosCollection.map((photo) => {
                const album = ourAlbumsToSave[photosCollectionIndex]
                const image = photo.images.find((image2) => image2.width + image2.height < 2000)
                const id = newId()

                ourUrlsToUpload.push({
                    id,
                    source: image.source,
                })

                return {
                    id,
                    userId,
                    albumId: album.id,
                }
            })
        })

        FBalbumsToSave.forEach((album, albumIndex) => {
            ourMetadataToSave.push({
                id: newId(),
                sourceId: ourAlbumsToSave[albumIndex].id,
                sourceType: 'FACEBOOK.ALBUM',
                data: { album },
            })
        })

        FBphotosToSave.forEach((photoCollection, photoCollectionIndex) => {
            photoCollection.forEach((photo, photoIndex) => {
                ourMetadataToSave.push({
                    id: newId(),
                    sourceId: ourPhotosToSave[photoCollectionIndex][photoIndex].id,
                    sourceType: 'FACEBOOK.PHOTO',
                    data: { photo },
                })
            })
        })

        // SAVE

        await Promise.all([
            Album.bulkCreate(ourAlbumsToSave),
            Photo.bulkCreate([].concat(...ourPhotosToSave)),
            Metadata.bulkCreate(ourMetadataToSave),
            Promise.all(ourUrlsToUpload.map((meta) => photoStorage.uploadFromUrl(meta.id, meta.source))),
        ])
    }

    return {
        download,
    }
}

import { IFacebookGraph } from './facebookGraphFactory'
import { IMetadataStatic } from '@orderify/metadata_storage'
import { IAlbumStatic, IImageStatic, IImageStorage } from '@orderify/image_library'

export function photoLibraryOnFacebookFactory(
    Album: IAlbumStatic,
    Image: IImageStatic,
    Metadata: IMetadataStatic,
    imageStorage: IImageStorage,
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
            return Album.build({
                name: album.name,
                userId,
            })
        })
        const ourPhotosToSave = FBphotosToSave.map((photosCollection, photosCollectionIndex) => {
            return photosCollection.map((photo) => {
                const album = ourAlbumsToSave[photosCollectionIndex]
                const image = photo.images.find((image2) => image2.width + image2.height < 2000)

                const ourImage = Image.build({
                    userId,
                    albumId: album.id,
                })

                ourUrlsToUpload.push({
                    id: ourImage.id,
                    source: image.source,
                })

                return ourImage
            })
        })

        FBalbumsToSave.forEach((album, albumIndex) => {
            ourMetadataToSave.push(Metadata.build({
                instanceId: ourAlbumsToSave[albumIndex].id,
                instanceType: 'ALBUM',
                source: 'FACEBOOK',
                data: { album },
            }))
        })

        FBphotosToSave.forEach((photoCollection, photoCollectionIndex) => {
            photoCollection.forEach((photo, photoIndex) => {
                ourMetadataToSave.push(Metadata.build({
                    instanceId: ourPhotosToSave[photoCollectionIndex][photoIndex].id,
                    instanceType: 'Image',
                    source: 'FACEBOOK',
                    data: { photo },
                }))
            })
        })

        // SAVE

        await Promise.all([
            Album.bulkCreate(ourAlbumsToSave),
            Image.bulkCreate([].concat(...ourPhotosToSave)),
            Metadata.bulkCreate(ourMetadataToSave),
            Promise.all(ourUrlsToUpload.map((meta) => imageStorage.uploadFromUrl(meta.id, meta.source))),
        ])
    }

    return {
        download,
    }
}

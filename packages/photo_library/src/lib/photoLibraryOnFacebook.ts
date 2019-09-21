import { FacebookMetadataType, facebookGraphFactory } from "@orderify/facebook"

import { AlbumType } from "./_/Album"
import { PhotoType } from "./_/Photo"
import { photoStorageFactory } from "./photoStorage"

export function photoLibraryOnFacebookFactory(
    Album: AlbumType,
    Photo: PhotoType,
    FacebookMetadata: FacebookMetadataType,
    photoStorage: ReturnType<typeof photoStorageFactory>,
    facebookGraph: ReturnType<typeof facebookGraphFactory>,
) {
    async function download(userId: number, access_token: string) {
        const albums = await facebookGraph.makeRequest(access_token, "me", "albums", {
            limit: 1000,
            fields: "name,type,created_time,updated_time",
        })

        const library = []
        for (const album of albums) {
            if (album.type === "profile") {
                library.push({
                    ...album,
                    photos: await facebookGraph.makeRequest(access_token, album.id, "photos", {
                        limit: 1000,
                        fields: "name,alt_text,images,created_time,updated_time,album",
                    }),
                })
            }
        }

        for (const album of library) {
            const ourAlbum = await Album.create({
                name: album.name,
                userId,
            })

            await FacebookMetadata.create({
                sourceId: album.id,
                sourcetype: "ALBUM",
                data: albums.find((alb) => album.id === alb.id),
            })

            const photosToCreate = album.photos.map((photo) => {
                const image = photo.images.find((image2) => image2.width + image2.height < 2000)

                return {
                    name: photo.name,
                    alt_text: photo.alt_text,
                    userId,
                    albumId: ourAlbum.id,
                    link: image.source,
                    width: image.width,
                    height: image.height,
                }
            })

            const ourPhotos = await Photo.bulkCreate(photosToCreate)

            const metadataToSave = ourPhotos.map((ourPhoto) =>
                ({
                    sourceId: ourPhoto.id,
                    sourceType: "PHOTO",
                    data: album.photos.find((ph) => ph.link === ourPhoto.link),
                }))

            await FacebookMetadata.bulkCreate(metadataToSave)

            // Should be awaited some time
            Promise.all(ourPhotos.map((ourPhoto) => photoStorage.uploadFromUrl(ourPhoto.id, ourPhoto.link)))
        }
    }

    return {
        download,
    }
}

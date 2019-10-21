import { FacebookGraph } from '@orderify/facebook_oauth'
import { MetadataStorage } from '@orderify/metadata_storage'
import { ImageStorage, IImageLibrary } from '@orderify/image_library'
import { uniq, prop, differenceWith, eqBy, path, map, propEq } from 'ramda'

interface IFBAlbum {
    id: string
    name: string
    type: string
    created_time: string
    updated_time: string
}

interface IFBPhoto {
    id: string
    name: string
    alt_text: string
    album: {
        id: string,
        name: string,
        created_time: string,
    },
    created_time: string
    updated_time: string
    images: Array<{
        width: number,
        height: number,
        source: string,
    }>
}

export class PhotoLibraryOnFacebook {
    constructor(
        private imageLibrary: IImageLibrary,
        private imageStorage: ImageStorage,
        private imagesMetadataStorage: MetadataStorage,
        private albumsMetadataStorage: MetadataStorage,
        private facebookGraph: FacebookGraph,
    ) { }

    public async sync(access_token: string, userId: string, albumIds: string[]) {
        const [remoteLibrary, localLibrary] = await Promise.all([
            this.getFBphotoLibrary(access_token, albumIds),
            this.getFBphotoLibraryLocal(userId),
        ])

        const remotePhotosToSync = differenceWith(eqBy(path(['photo', 'id'])), remoteLibrary, localLibrary)
        const remoteAlbumsToSyncUnormalized = differenceWith(eqBy(path(['album', 'id'])), remoteLibrary, localLibrary)
        const remoteAlbumsToSync = uniq(map(prop('album'), remoteAlbumsToSyncUnormalized))

        const albumsBuilded = remoteAlbumsToSync.map(album => ({
            albumFB: album,
            album: this.imageLibrary.buildAlbum({
                userId,
                name: album.name,
            }),
        }))

        const photosBuilded = remotePhotosToSync.map(remoteLibEntry => ({
            photoFB: remoteLibEntry.photo,
            file: remoteLibEntry.photo.images.find(img => img.width + img.height < 2000),
            image: this.imageLibrary.buildImage({
                userId,
                albumId: albumsBuilded.
                    find(albumBuilded => albumBuilded.albumFB.id === remoteLibEntry.album.id).album.id,
            }),
        }))

        const albumsMetadataBuilded = albumsBuilded.map(albumBuilded => {
            return this.albumsMetadataStorage.build({
                instanceId: albumBuilded.album.id,
                userId,
                data: {
                    album: albumBuilded.albumFB,
                },
            })
        })
        const photosMetadataBuilded = photosBuilded.map(photoBuilded => {
            return this.imagesMetadataStorage.build({
                instanceId: photoBuilded.image.id,
                userId,
                data: {
                    photo: photoBuilded.photoFB,
                },
            })
        })

        const chunkedArrayOfUrls = chunks(photosBuilded.map(
            photo => ({ id: photo.image.id, url: photo.file.source }),
        ), 30)

        await Promise.all([
            this.imageLibrary.bulkCreateAlbums(albumsBuilded.map(album => album.album)),
            this.imageLibrary.bulkCreateImages(photosBuilded.map(photo => photo.image)),
            this.imagesMetadataStorage.bulkCreate(photosMetadataBuilded),
            this.albumsMetadataStorage.bulkCreate(albumsMetadataBuilded),
            Promise.all(chunkedArrayOfUrls.map(urls => this.imageStorage.uploadFromUrl(urls))),
        ])
    }

    public async getFBalbums(access_token: string) {
        return await this.facebookGraph.makeRequest(access_token, 'me', 'albums', {
            limit: 1000,
            fields: 'name,type,created_time,updated_time',
        }) as IFBAlbum[]
    }

    private async getFBphotos(access_token: string, albumId: string) {
        return await this.facebookGraph.makeRequest(access_token, albumId, 'photos', {
            limit: 1000,
            fields: 'name,alt_text,images,created_time,updated_time,album',
        }) as IFBPhoto[]
    }

    private async getFBphotoLibrary(access_token: string, albumIds: string[]) {
        const albums = await this.getFBalbums(access_token)
        const albumProfile = albums.filter(propEq('type', 'profile'))
        const albumsToSync = albums.filter(album => albumIds.find(albumId => albumId === album.id))

        const albumsToSave = [...albumsToSync, ...albumProfile]
        const photos = await Promise.all(albumsToSave.map(album => this.getFBphotos(access_token, album.id)))

        return photos.flat().map(photo => {
            return {
                album: albumsToSave.find(album => album.id === photo.album.id),
                photo,
            }
        })
    }

    private async getFBphotoLibraryLocal(userId: string) {
        const [photoMeta, albumMeta] = await Promise.all([
            await this.imagesMetadataStorage.findByUserId(userId),
            await this.albumsMetadataStorage.findByUserId(userId),
        ])

        return photoMeta.map(photoMetadata => {
            const albumMetadata = albumMeta.find(meta => meta.data.album.id === photoMetadata.data.photo.album.id)

            return {
                album: albumMetadata.data.album as IFBAlbum,
                photo: photoMetadata.data.photo as IFBPhoto,
                photoMetadata,
                albumMetadata,
            }
        })
    }
}

function chunks<T>(array: T[], chunkSize: number) {
    return Array(
        Math.ceil(array.length / chunkSize))
        .fill(null)
        .map((_, i) => array.slice(i * chunkSize, i * chunkSize + chunkSize)) as T[][]
}

import { IFacebookGraph } from './facebookGraphFactory'
import { IMetadataStatic } from '@orderify/metadata_storage'
import { ImageStorage, IAlbumStaticWrite, IImageStaticWrite } from '@orderify/image_library'

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
        private Album: IAlbumStaticWrite,
        private Image: IImageStaticWrite,
        private Metadata: IMetadataStatic,
        private imageStorage: ImageStorage,
        private facebookGraph: IFacebookGraph,
    ) { }

    public async sync(access_token: string, userId: string) {
        const [remoteLibrary, localLibrary] = await Promise.all([
            this.getFBphotoLibrary(access_token),
            this.getFBphotoLibraryLocal(userId),
        ])

        const notSyncedPhotos = remoteLibrary.filter(remoteEntry => {
            return !localLibrary.find(localEntry => remoteEntry.photo.id === localEntry.photo.id)
        })

        const albumsOfNotSyncedPhotos = [...new Set(notSyncedPhotos.map(entry => entry.album))]
        const albumsOfSyncedPhotos = [...new Set(localLibrary.map(entry => entry.album))]

        const notSyncedAlbums = albumsOfNotSyncedPhotos.filter(remoteAlbum => {
            return !albumsOfSyncedPhotos.filter(localAlbum => localAlbum.id === remoteAlbum.id)
        })

        const albumsBuilded = notSyncedAlbums.map(album => {
            return {
                albumFB: album,
                album: this.Album.build({
                    userId,
                    name: album.name,
                }),
            }
        })

        const photosBuilded = notSyncedPhotos.map(entry => {
            const file = entry.photo.images.find(img => img.width + img.height < 2000)

            return {
                photoFB: entry.photo,
                file,
                image: this.Image.build({
                    userId,
                    albumId: albumsBuilded.find(albumBuilded => albumBuilded.albumFB.id === entry.album.id).album.id,
                }),
            }
        })

        const albumsMetadataBuilded = albumsBuilded.map(albumBuilded => {
            return this.Metadata.build({
                instanceId: albumBuilded.album.id,
                instanceType: 'ALBUM',
                source: 'FACEBOOK.ALBUM',
                userId,
                data: {
                    album: albumBuilded.albumFB,
                },
            })
        })
        const photosMetadataBuilded = photosBuilded.map(photoBuilded => {
            return this.Metadata.build({
                instanceId: photoBuilded.image.id,
                instanceType: 'IMAGE',
                source: 'FACEBOOK.PHOTO',
                userId,
                data: {
                    photo: photoBuilded.photoFB,
                },
            })
        })

        await Promise.all([
            this.Album.bulkCreate(albumsBuilded.map(album => album.album)),
            this.Image.bulkCreate(photosBuilded.map(photo => photo.image)),
            this.Metadata.bulkCreate([...albumsMetadataBuilded, ...photosMetadataBuilded]),
            Promise.all(photosBuilded.map(photo => this.imageStorage.uploadFromUrl(photo.image.id, photo.file.source))),
        ])
    }

    private async getFBalbums(access_token: string) {
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

    private async getFBphotoLibrary(access_token: string) {
        const albums = await this.getFBalbums(access_token)
        const albumsToSave = albums.filter(album => album.type === 'profile')
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
            await this.Metadata.findAll({
                where: {
                    instanceType: 'IMAGE',
                    source: 'FACEBOOK.PHOTO',
                    userId,
                },
            }),
            await this.Metadata.findAll({
                where: {
                    instanceType: 'ALBUM',
                    source: 'FACEBOOK.ALBUM',
                    userId,
                },
            }),
        ])

        return photoMeta.map(photoMetadata => {
            const albumMetadata = albumMeta.find(meta => meta.data.id === photoMetadata.data.album.id)

            return {
                album: albumMetadata.data as IFBAlbum,
                photo: photoMetadata.data as IFBPhoto,
                photoMetadata,
                albumMetadata,
            }
        })
    }
}

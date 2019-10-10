import { FacebookGraph } from './FacebookGraph'
import { IMetadataStatic } from '@orderify/metadata_storage'
import { ImageStorage, IAlbumStaticWrite, IImageStaticWrite } from '@orderify/image_library'
import { uniq, prop, differenceWith, eqBy, path, map } from 'ramda'

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
        private Album: IAlbumStaticWrite,
        private Image: IImageStaticWrite,
        private Metadata: IMetadataStatic,
        private imageStorage: ImageStorage,
        private facebookGraph: FacebookGraph,
    ) { }

    public async sync(access_token: string, userId: string) {
        const [remoteLibrary, localLibrary] = await Promise.all([
            this.getFBphotoLibrary(access_token),
            this.getFBphotoLibraryLocal(userId),
        ])

        const remotePhotosToSync = differenceWith(eqBy(path(['photo', 'id'])), remoteLibrary, localLibrary)
        const remoteAlbumsToSyncUnormalized = differenceWith(eqBy(path(['album', 'id'])), remoteLibrary, localLibrary)
        const remoteAlbumsToSync = uniq(map(prop('album'), remoteAlbumsToSyncUnormalized))

        const albumsBuilded = remoteAlbumsToSync.map(album => ({
            albumFB: album,
            album: this.Album.build({
                userId,
                name: album.name,
            }).toJSON()
        }))

        const photosBuilded = remotePhotosToSync.map(remoteLibEntry => ({
            photoFB: remoteLibEntry.photo,
            file: remoteLibEntry.photo.images.find(img => img.width + img.height < 2000),
            image: this.Image.build({
                userId,
                albumId: albumsBuilded.find(albumBuilded => albumBuilded.albumFB.id === remoteLibEntry.album.id).album.id,
            }).toJSON(),
        }))

        const albumsMetadataBuilded = albumsBuilded.map(albumBuilded => {
            return this.Metadata.build({
                instanceId: albumBuilded.album.id,
                instanceType: 'ALBUM',
                source: 'FACEBOOK.ALBUM',
                userId,
                data: {
                    album: albumBuilded.albumFB,
                },
            }).toJSON()
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
            }).toJSON()
        })

        const chunkedArrayOfUrls = chunks(photosBuilded.map(
            photo => ({ id: photo.image.id, url: photo.file.source }),
        ), 30)

        await Promise.all([
            this.Album.bulkCreate(albumsBuilded.map(album => album.album)),
            this.Image.bulkCreate(photosBuilded.map(photo => photo.image)),
            this.Metadata.bulkCreate([...albumsMetadataBuilded, ...photosMetadataBuilded]),
            Promise.all(chunkedArrayOfUrls.map(urls => this.imageStorage.uploadFromUrl(urls))),
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
        const albumsToSave = albums.filter(album => album.type === 'profile' || album.type === 'cover')
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

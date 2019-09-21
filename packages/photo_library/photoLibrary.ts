import { AlbumType } from './_/Album'
import { PhotoType } from './_/Photo'

export function photoLibraryFactory(Photo: PhotoType, Album: AlbumType) {
    async function getPhotoById(id: number, userId: number) {
        const photo = await Photo.findOne({ where: { userId, id } })

        return photo ? <any>photo.toJSON() : undefined
    }

    async function getPhotosByUserId(userId: number) {
        return (await Photo.findAll({ where: { userId } })).map(instance => instance.toJSON())
    }

    async function getAlbumsByUserId(userId: number) {
        return (await Album.findAll({ where: { userId } })).map(instance => instance.toJSON())
    }

    return {
        getPhotoById,
        getPhotosByUserId,
        getAlbumsByUserId,
    }
}
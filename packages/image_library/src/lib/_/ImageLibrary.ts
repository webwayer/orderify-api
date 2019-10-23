import { IImage } from './_/Image'
import { IAlbum } from './_/Album'

export class ImageLibrary {
    constructor(private Image: IImage, private Album: IAlbum) { }

    public async findImageById(id: string) {
        return await this.Image.findByPk(id)
    }

    public async bulkCreateAlbums(objs: Parameters<IAlbum['bulkCreate']>[0]) {
        return this.Album.bulkCreate(objs)
    }

    public async bulkCreateImages(objs: Parameters<IImage['bulkCreate']>[0]) {
        return this.Image.bulkCreate(objs)
    }

    public buildAlbum(obj: Parameters<IAlbum['build']>[0]) {
        return this.Album.build(obj)
    }

    public buildImage(obj: Parameters<IImage['build']>[0]) {
        return this.Image.build(obj)
    }

    public async findAlbumsByUserId(userId: string) {
        return this.Album.findAll({
            where: {
                userId,
            },
        })
    }

    public async findImagesByUserIdAndAlbumId(userId: string, albumId: string) {
        return this.Image.findAll({
            where: {
                userId,
                albumId,
            },
        })
    }
}

type PublicPart<T> = { [K in keyof T]: T[K] }
export type IImageLibrary = PublicPart<ImageLibrary>

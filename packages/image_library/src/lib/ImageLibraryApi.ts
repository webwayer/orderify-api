import { IImageStatic } from './Image'

export class ImageLibraryApi {
    constructor(private Image: IImageStatic) { }

    public async findImageById(id: string) {
        return (await this.Image.findByPk(id)).toJSON()
    }
}

type PublicPart<T> = { [K in keyof T]: T[K] }
export type IImageLibraryApi = PublicPart<ImageLibraryApi>

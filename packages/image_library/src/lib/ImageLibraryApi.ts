import { IImage } from './Image'

export class ImageLibraryApi {
    constructor(private Image: IImage) { }

    public async findImageById(id: string) {
        return await this.Image.findByPk(id)
    }
}

type PublicPart<T> = { [K in keyof T]: T[K] }
export type IImageLibraryApi = PublicPart<ImageLibraryApi>

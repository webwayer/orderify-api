import { Op } from 'sequelize'
import { uniqWith, filter, difference } from 'ramda'

import { IAlbum, IImage } from '@orderify/image_library'
import { ICampaign } from '@orderify/compare_campaigns'

export async function syncFillers(
    actualImages: string[],
    Album: IAlbum,
    Image: IImage,
    Campaign: ICampaign,
    imageToStorage: (image: string) => Promise<any>,
) {
    const album = await Album.findOne({
        where: {
            id: 'fillers',
            name: 'Fillers',
            userId: 'root',
        },
    }) || await Album.create({
        id: 'fillers',
        name: 'Fillers',
        userId: 'root',
    })

    const existingImages = (await Image.findAll({
        where: {
            userId: 'root',
            albumId: 'fillers',
        },
    })).map(img => img.id)

    const newImages = difference(actualImages, existingImages)
    const oldImages = difference(existingImages, actualImages)

    await Image.destroy({
        where: {
            id: {
                [Op.in]: oldImages,
            },
        },
    })
    await Image.bulkCreate(newImages.map(id => ({
        id,
        userId: 'root',
        albumId: 'fillers',
    })))
    await Promise.all(newImages.map(img => imageToStorage(img)))

    const finishedCampaigns = (await Campaign.update({
        status: 'finished',
    }, {
        where: {
            [Op.or]: {
                photo1Id: {
                    [Op.in]: oldImages,
                },
                photo2Id: {
                    [Op.in]: oldImages,
                },
            },
        },
    })).map(cam => ([cam.photo1Id, cam.photo2Id]))

    const existingCampaings = (await Campaign.findAll({
        where: {
            type: 'filler',
            userId: 'root',
            status: 'active',
        },
    })).map(cam => ([cam.photo1Id, cam.photo2Id]))

    const campaings = []
    for (const image1 of actualImages) {
        for (const image2 of actualImages) {
            campaings.push([image1, image2])
        }
    }

    const sameImage = ([img1, img2]) => img1 !== img2
    const pair = ([img11, img12], [img21, img22]) => {
        return (img11 === img22 && img12 === img21) || (img11 === img21 && img12 === img22)
    }

    const normalizedCampaigns = uniqWith(pair)(filter(sameImage)(campaings))

    const newCampaigns = difference(normalizedCampaigns, existingCampaings as any)

    await Campaign.bulkCreate(newCampaigns.map(([img1, img2]) => ({
        userId: 'root',
        photo1Id: img1,
        photo2Id: img2,
        type: 'filler',
        comparisonCount: 1000000,
    })))

    return {
        newImages,
        oldImages,
        newCampaigns,
        finishedCampaigns,
    }
}

import assert from 'assert'

import { syncFillers } from '../..'
import { sequelize, Album, Image, Campaign, imageToNowhere } from '../setup'

describe('Sync fillers', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
    })
    it('no fillers before', async () => {
        const sync = await syncFillers(['1', '2', '3', '4', '5'], Album, Image, Campaign, imageToNowhere)

        assert.deepEqual(sync, {
            newImages: ['1', '2', '3', '4', '5'],
            oldImages: [],
            newCampaigns: [
                ['1', '2'],
                ['1', '3'],
                ['1', '4'],
                ['1', '5'],
                ['2', '3'],
                ['2', '4'],
                ['2', '5'],
                ['3', '4'],
                ['3', '5'],
                ['4', '5'],
            ],
            finishedCampaigns: [],
        })
    })

    it('add new fillers', async () => {
        await syncFillers(['1', '2'], Album, Image, Campaign, imageToNowhere)
        const sync = await syncFillers(['1', '2', '3', '4'], Album, Image, Campaign, imageToNowhere)

        assert.deepEqual(sync, {
            newImages: ['3', '4'],
            oldImages: [],
            newCampaigns: [
                ['1', '3'],
                ['1', '4'],
                ['2', '3'],
                ['2', '4'],
                ['3', '4'],
            ],
            finishedCampaigns: [],
        })
    })

    it('remove fillers', async () => {
        await syncFillers(['1', '2', '3', '4'], Album, Image, Campaign, imageToNowhere)
        const sync = await syncFillers(['3', '4'], Album, Image, Campaign, imageToNowhere)

        assert.deepEqual(sync, {
            newImages: [],
            oldImages: ['1', '2'],
            newCampaigns: [],
            finishedCampaigns: [
                ['1', '2'],
                ['1', '3'],
                ['1', '4'],
                ['2', '3'],
                ['2', '4'],
            ],
        })
    })

    it('add new & remove fillers', async () => {
        await syncFillers(['1', '2', '3', '4'], Album, Image, Campaign, imageToNowhere)
        const sync = await syncFillers(['3', '4', '5', '6'], Album, Image, Campaign, imageToNowhere)

        assert.deepEqual(sync, {
            newImages: ['5', '6'],
            oldImages: ['1', '2'],
            newCampaigns: [
                ['3', '5'],
                ['3', '6'],
                ['4', '5'],
                ['4', '6'],
                ['5', '6'],
            ],
            finishedCampaigns: [
                ['1', '2'],
                ['1', '3'],
                ['1', '4'],
                ['2', '3'],
                ['2', '4'],
            ],
        })
    })
})

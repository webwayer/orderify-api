import request from 'supertest'

import { sequelize, app, auth, jwtAccessToken } from '../service'

describe('logout', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
    })
    it('success', async () => {
        const accessToken = await auth.logIn('user')
        const jwt = await jwtAccessToken.create(accessToken)

        await request(app).get('/auth/logout').set('Authorization', `Bearer ${jwt}`).expect(200)
    })

    it('fail - no accessToken', async () => {
        await request(app).get('/auth/logout').expect(500)
    })
})

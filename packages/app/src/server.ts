import { updateConfig, SequelizeFactory, Jobs, LambdaFactory } from '@orderify/io'
import { appFactory } from './lib/appFactory'
import { DEFAULT_APP_CONFIG } from './config'

const CONFIG = updateConfig(DEFAULT_APP_CONFIG, process.env)
const sequelize = SequelizeFactory(CONFIG.DATABASE)
const jobs = new Jobs(LambdaFactory(CONFIG.AWS))

const app = appFactory(CONFIG, sequelize, jobs)

app.listen(CONFIG.API.PORT, err => {
    if (err) {
        throw err
    }
    // tslint:disable-next-line: no-console
    console.log('ready')
})

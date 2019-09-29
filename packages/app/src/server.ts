import { DEFAULT_CONFIG, updateConfig } from './lib/config'
import { appFactory } from './lib/app'

const config = updateConfig(DEFAULT_CONFIG, process.env)

const app = appFactory(config)
app.listen(config.API.PORT, err => {
    if (err) {
        throw err
    }
    // tslint:disable-next-line: no-console
    console.log('ready')
})

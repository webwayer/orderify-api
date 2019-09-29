import { DEFAULT_CONFIG, updateConfig } from './lib/config'
import { ioFactory, startup, appFactory } from './lib/app'

const config = updateConfig(DEFAULT_CONFIG, process.env)
const io = ioFactory(config)
const app = appFactory(io, config)

startup(io, config).then(() => {
    app.listen(config.API.PORT, err => {
        if (err) {
            throw err
        }
        // tslint:disable-next-line: no-console
        console.log('ready')
    })
})

import { Express } from 'express'

export async function appFactory(app: Express, CONFIG: { PORT: string }) {
    await new Promise((resolve, reject) => {
        app.listen(CONFIG.PORT, err => {
            if (err) {
                reject(err)
            }
            resolve()
        })
    })

    return app
}
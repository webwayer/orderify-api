import session from 'express-session'
import { Sequelize } from 'sequelize'

export async function sequelizeSessionStoreFactory(
    sequelize: Sequelize,
    CONFIG: { DROP_ON_SYNC: string; SYNC_SCHEMAS: string },
) {
    const SequelizeStore = require('connect-session-sequelize')(session.Store)

    const store = new SequelizeStore({
        db: sequelize,
    })

    // TODO: sync only Session table
    if (CONFIG.SYNC_SCHEMAS) {
        await sequelize.sync({ force: !!CONFIG.DROP_ON_SYNC })
    }

    return store
}

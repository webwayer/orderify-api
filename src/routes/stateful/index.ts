import { Router } from 'express'
import * as session from 'express-session'
import { Sequelize} from 'sequelize'

import { router as authRouter } from './auth'

export const router = Router();

const sequelize = new Sequelize(
    "orderify",
    "",
    "", {
        "dialect": "postgres",
        "host": "localhost",
        "port": 5432
    }
);

const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelizeStore = new SequelizeStore({
    db: sequelize
})
// sequelize.sync();

router.use(session({
    secret: 'keyboard cat',
    store: sequelizeStore,
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
}))
router.use(authRouter)
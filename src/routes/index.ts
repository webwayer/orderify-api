import { Router } from 'express'

import { router as statefulRouter } from './stateful'
import { router as statelessRouter } from './stateless'

export const router = Router();

router.use(statefulRouter)
router.use(statelessRouter)
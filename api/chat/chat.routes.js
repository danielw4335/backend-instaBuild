import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import {createChat, getChats, deleteChat, addMsg} from './chat.controller.js'

const router = express.Router()

router.get('/', log, getChats)
router.post('/', log, requireAuth, createChat)
router.post('/:id/msg', requireAuth, addMsg)
router.delete('/:id', requireAuth, deleteChat)

export const chatRoutes = router
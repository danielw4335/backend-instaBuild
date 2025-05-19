import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getStories, getStoryById, addStory, updateStory, removeStory, addStoryMsg, removeStoryMsg } from './story.controller.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log, getStories)
router.get('/:id', log, getStoryById)
router.post('/', log, requireAuth, addStory)
router.put('/:id', requireAuth, updateStory)
router.delete('/:id', requireAuth, removeStory)
// router.delete('/:id', requireAuth, requireAdmin, removeStory)

router.post('/:id/msg', requireAuth, addStoryMsg)
router.delete('/:id/msg/:msgId', requireAuth, removeStoryMsg)

export const storyRoutes = router
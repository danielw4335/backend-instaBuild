import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

const PAGE_SIZE = 3

export const storyService = {
	query,
	getById,
	add,
	update,
	remove,
	addStoryMsg,
	removeStoryMsg,
}

async function query(filterBy = { txt: '', userId: '' }) {
	try {
		const criteria = _buildCriteria(filterBy)
		const collection = await dbService.getCollection('story')

		const storyCursor = collection.find(criteria).sort({ createdAt: -1 })

		const stories = await storyCursor.toArray()
		return stories
	} catch (err) {
		logger.error('cannot find stories', err)
		throw err
	}
}

async function getById(storyId) {
	try {
		const criteria = { _id: ObjectId.createFromHexString(storyId) }

		const collection = await dbService.getCollection('story')
		const story = await collection.findOne(criteria)

		story.createdAt = story._id.getTimestamp()
		return story
	} catch (err) {
		logger.error(`while finding story ${storyId}`, err)
		throw err
	}
}


async function remove(storyId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    if (!loggedinUser) throw 'Unauthorized'

    const userId = loggedinUser._id

    try {
        const criteria = { 
            _id:  ObjectId.createFromHexString(storyId),
            'by._id': userId
        }

        const collection = await dbService.getCollection('story')
        const res = await collection.deleteOne(criteria)

        if (res.deletedCount === 0) throw 'Not your story or not found'
        return storyId
    } catch (err) {
        logger.error(`cannot remove story ${storyId}`, err)
        throw err
    }
}


async function add(story) {
	try {
		const collection = await dbService.getCollection('story')
		await collection.insertOne(story)

		return story
	} catch (err) {
		logger.error('cannot insert story', err)
		throw err
	}
}

async function update(story) {
	const storyToSave = { story }

	try {
		const criteria = { _id: ObjectId.createFromHexString(story._id) }

		const collection = await dbService.getCollection('story')
		await collection.updateOne(criteria, { $set: storyToSave })

		return story
	} catch (err) {
		logger.error(`cannot update story ${story._id}`, err)
		throw err
	}
}

async function addStoryMsg(storyId, msg) {
	try {
		const criteria = { _id: ObjectId.createFromHexString(storyId) }
		msg.id = makeId()

		const collection = await dbService.getCollection('story')
		await collection.updateOne(criteria, { $push: { msgs: msg } })

		return msg
	} catch (err) {
		logger.error(`cannot add story msg ${storyId}`, err)
		throw err
	}
}

async function removeStoryMsg(storyId, msgId) {
	try {
		const criteria = { _id: ObjectId.createFromHexString(storyId) }

		const collection = await dbService.getCollection('story')
		await collection.updateOne(criteria, { $pull: { msgs: { id: msgId } } })

		return msgId
	} catch (err) {
		logger.error(`cannot remove story msg ${storyId}`, err)
		throw err
	}
}

function _buildCriteria(filterBy) {
	const criteria = {
		txt: { $regex: filterBy.txt, $options: 'i' },
	}

	return criteria
}

function _buildSort(filterBy) {
	if (!filterBy.sortField) return {}
	return { [filterBy.sortField]: filterBy.sortDir }
}
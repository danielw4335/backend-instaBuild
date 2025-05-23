import { ObjectId } from 'mongodb'

import { asyncLocalStorage } from '../../services/als.service.js'
import { logger } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'

export const chatService = { query, createChat, remove, addMsg }

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('chat')
        const chats = await collection
            .find(criteria)
            .sort({ createdAt: -1 }) 
            .toArray()

        return chats
    } catch (err) {
        logger.error('cannot get chats', err)
        throw err
    }
}

async function createChat({ userIds }) {
    const chatToAdd = {
        users: userIds.map(id => ObjectId.createFromHexString(id)),
        msgs: [],
        createdAt: new Date()
    }

    const collection = await dbService.getCollection('chat')
    const res = await collection.insertOne(chatToAdd)

    chatToAdd._id = res.insertedId
    return chatToAdd
}


async function remove(chatId, loggedinUser) {
    try {
        const collection = await dbService.getCollection('chat')
        const criteria = {
            _id: ObjectId.createFromHexString(chatId),
            users: { $in: [ObjectId.createFromHexString(loggedinUser._id)] }
        }
        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove chat ${chatId}`, err)
        throw err
    }
}



async function addMsg({ chatId, msg }) {
    console.log('  msg:', msg)
    console.log('  chatId:', chatId)
    try {
        msg.id = new ObjectId().toHexString()
        const collection = await dbService.getCollection('chat')
        const res = await collection.findOneAndUpdate(
            { _id: ObjectId.createFromHexString(chatId) },
            { $push: { msgs: msg } },
            { returnDocument: 'after' }
        )
        return res.value
    } catch (err) {
        logger.error('cannot add msg', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}

    if (filterBy.userId) {
        criteria.users = ObjectId.createFromHexString(filterBy.userId)
    }
    return criteria
}

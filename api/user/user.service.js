import {dbService} from '../../services/db.service.js'
import {logger} from '../../services/logger.service.js'
import {chatService} from '../chat/chat.service.js'
import { ObjectId } from 'mongodb'

export const userService = {
	add, // Create (Signup)
	getById, // Read (Profile page)
	update, // Update (Edit profile)
	remove, // Delete (remove user)
	query, // List (of users)
	getByUsername, // Used for Login
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('user')
        var users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = user._id.getTimestamp()
            // Returning fake fresh data
            // user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        var criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('user')
        const user = await collection.findOne(criteria)
        delete user.password
        // console.log(user)

        criteria = { byUserId: userId }

        user.givenChats = await chatService.query(criteria)
        
        user.givenChats = user.givenChats.map(chat => {
            delete chat.byUser
            return chat
        })
        
        return user
    } catch (err) {
        logger.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
	try {
		const collection = await dbService.getCollection('user')
		const user = await collection.findOne({ username })
		return user
	} catch (err) {
		logger.error(`while finding user by username: ${username}`, err)
		throw err
	}
}

async function remove(userId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('user')
        await collection.deleteOne(criteria)
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        const userToSave = {
            _id: ObjectId.createFromHexString(user._id),
            fullname: user.fullname,
            bio: user.bio,
            imgUrl: user.imgUrl,
            likedStoryIds: user.likedStoryIds || [],
            savedStoryIds: user.savedStoryIds || [],
            following: user.following || [],
            followers: user.followers || [],
            posts: user.posts || [],
            comments: user.comments || [],
        }
        const collection = await dbService.getCollection('user')
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        return userToSave
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function add(user) {
    try {
        const userToAdd = {
            username: user.username,
            password: user.password, 
            fullname: user.fullname,
            bio: user.bio || '',
            imgUrl: user.imgUrl || '',
            likedStoryIds: user.likedStoryIds || [],
            savedStoryIds: user.savedStoryIds || [],
            following: user.following || [],
            followers: user.followers || [],
            posts: user.posts || [],
            comments: user.comments || [],
        }
        const collection = await dbService.getCollection('user')
        await collection.insertOne(userToAdd)
        return userToAdd
    } catch (err) {
        logger.error('cannot add user', err)
        throw err
    }
}


function _buildCriteria(filterBy) {
	const criteria = {}
 if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            { username: txtCriteria },
            { fullname: txtCriteria },
        ]
    }
	return criteria
}
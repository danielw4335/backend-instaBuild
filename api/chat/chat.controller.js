import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'
import { userService } from '../user/user.service.js'
import { authService } from '../auth/auth.service.js'
import { chatService } from './chat.service.js'

export async function getChats(req, res) {
    try {
        const chats = await chatService.query(req.query)
        res.send(chats)
    } catch (err) {
        logger.error('Cannot get chats', err)
        res.status(400).send({ err: 'Failed to get chats' })
    }
}

export async function createChat(req, res) {
    const { userIds = [] } = req.body
    const { loggedinUser } = req 
    try {
        const allUserIds = Array.from(new Set([...userIds, loggedinUser._id]))
        if (allUserIds.length !== 2) {
            return res.status(400).send({ err: 'Chat must have exactly two users' })
        }
        const chat = await chatService.createChat({ userIds: allUserIds })
        res.send(chat)
    } catch (err) {
        logger.error('Failed to create chat', err)
        res.status(400).send({ err: 'Failed to create chat' })
    }
}

export async function deleteChat(req, res) {
    const { loggedinUser } = req
    const { id: chatId } = req.params

    try {
        const deletedCount = await chatService.remove(chatId, loggedinUser)
        if (deletedCount === 1) {
            // socketService.broadcast({ type: 'chat-removed', data: chatId, userId: loggedinUser._id })
            res.send({ msg: 'Deleted successfully' })
        } else {
            res.status(400).send({ err: 'Cannot remove chat' })
        }
    } catch (err) {
        logger.error('Failed to delete chat', err)
        res.status(400).send({ err: 'Failed to delete chat' })
    }
}

export async function addMsg(req, res) {
    const { msg } = req.body
    const { id: chatId } = req.params
    try {
        const updatedChat = await chatService.addMsg({ chatId, msg })
        // socketService.broadcast({ type: 'msg-added', data: updatedChat, userId: loggedinUser._id })
        res.send(updatedChat)
    } catch (err) {
        logger.error('Failed to add msg', err)
        res.status(400).send({ err: 'Failed to add msg' })
    }
}



import { Request, Response, Router } from "express";
import MessageRepository from "../../repositories/implementation/chat/MessageRepository";
import ChatService from "../../services/implementation/chat/messageService";
import MessageController from "../../controller/implementation/chat/MessageController";
import authMiddleWare from "../../middleware/authMiddleware";
import { Types } from "mongoose";
import { StatusCode } from "../../constants/statusCode";
import { onlineUsers } from "../../utils/chatSocket"; 


const router = Router()


const messageRepo = new MessageRepository();
const chatService = new ChatService(messageRepo);
const chatController = new MessageController(chatService);

//chat history
router.get("/history/:userId", authMiddleWare, (req, res) => {
    chatController.getChatHistory(req, res)
})

//status checking online/offile
router.get("/status/:userId", authMiddleWare, async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        if (!Types.ObjectId.isValid(userId)) {
            res.status(StatusCode.BAD_REQUEST).json({ error: "Invalid user ID" });
        }

        const isOnline = onlineUsers.has(userId);

        res.status(StatusCode.OK).json({
            success: true,
            userId,
            online: isOnline,
        });
    } catch (error) {
        console.error("User status check error:", error);
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: "Failed to get user status" });
    }
});


router.patch("/messages/mark-read/:senderId",authMiddleWare,(req,res)=>{
    chatController.markMessagesAsRead(req,res)
})

export default router
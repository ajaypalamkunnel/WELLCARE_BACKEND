import { Types } from "mongoose";
import { StatusCode } from "../../../constants/statusCode";
import { IChatService } from "../../../services/interfaces/chat/IMessageService";
import { CustomError } from "../../../utils/CustomError";
import { IMessageController } from "../../interfaces/chat/IMessageController";
import { Request, Response } from "express";
import {
    generateErrorResponse,
    generateSuccessResponse,
} from "../../../utils/response";

class MessageController implements IMessageController {
    private _messageService: IChatService;

    constructor(messageService: IChatService) {
        this._messageService = messageService;
    }

    async getChatHistory(req: Request, res: Response): Promise<Response> {
        try {
            const currentUserId = req.user?.userId;
            const otherUserId = req.params.userId;

            if (!currentUserId) {
                throw new CustomError("Unauthorized access", StatusCode.UNAUTHORIZED);
            }

            if (!otherUserId) {
                throw new CustomError(
                    "Target user ID is missing",
                    StatusCode.BAD_REQUEST
                );
            }

            const messages = await this._messageService.getChatHistory(
                new Types.ObjectId(currentUserId),
                new Types.ObjectId(otherUserId)
            );

            return res.status(StatusCode.OK).json({
                success: true,
                message: "Chat history fetched successfully",
                data: messages,
            });
        } catch (error) {
            console.error(" Error fetching chat history:", error);

            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : "Internal server error"
                    )
                );
        }
    }

    async getUserInbox(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.user?.userId;


            if (!userId) {
                throw new CustomError("Unauthorized", StatusCode.UNAUTHORIZED);
            }

            const inbox = await this._messageService.getInboxForUser(
                new Types.ObjectId(userId),
                "Doctor"
            );

            console.log("🌟controller inbox ", inbox);
            return res
                .status(StatusCode.OK)
                .json(generateSuccessResponse("Inbox fetched", inbox));
        } catch (error) {
            console.error(" Error fetching Inbox:", error);

            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : "Internal server error"
                    )
                );
        }
    }

    async getDoctorInbox(req: Request, res: Response): Promise<Response> {
        try {
            const doctorId = req.user?.userId;
            if (!doctorId) {
                throw new CustomError("Unauthorized", StatusCode.UNAUTHORIZED);
            }

            const inbox = await this._messageService.getInboxForUser(
                new Types.ObjectId(doctorId),
                "User"
            );
            return res
                .status(200)
                .json(generateSuccessResponse("Inbox fetched", inbox));
        } catch (error) {
            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : "Internal server error"
                    )
                );
        }
    }

    async markMessagesAsRead(req: Request, res: Response): Promise<Response> {
        const receiverId = req.user?.userId;
        const senderId = req.params.senderId;

        if (!receiverId || !senderId) {
            return res
                .status(StatusCode.BAD_REQUEST)
                .json({ success: false, message: "Missing required parameters" });
        }

        try {
            await this._messageService.markMessagesAsRead(
                new Types.ObjectId(senderId),
                new Types.ObjectId(receiverId)
            );

            return res
                .status(StatusCode.OK)
                .json(generateSuccessResponse("Messages marked as read"));
        } catch (error) {
            console.log("mark message as readed error : ",error);
            
            return res
                .status(StatusCode.INTERNAL_SERVER_ERROR)
                .json(generateErrorResponse("Internal Server Error"));
        }
    }
}

export default MessageController;

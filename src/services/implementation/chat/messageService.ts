import { Types } from "mongoose";
import { IMessage, MediaType } from "../../../model/chat/message";
import { IMessageRepository } from "../../../repositories/interfaces/chat/IMessageRepository";
import { IChatService } from "../../interfaces/chat/IMessageService";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";
import { ChatInboxItemDTO, firstChatDTO } from "../../../types/chat";
import IDoctorRepository from "../../../repositories/interfaces/doctor/IDoctor";

class ChatService implements IChatService {
    private _messageRepository: IMessageRepository;

    constructor(messageRepository: IMessageRepository) {
        this._messageRepository = messageRepository;
    }

    async sendMessage(
        senderId: Types.ObjectId,
        receiverId: Types.ObjectId,
        senderModel: "User" | "Doctor",
        receiverModel: "User" | "Doctor",
        content: string,
        type: "text" | "image" | "file",
        mediaUrl?: string,
        mediaType?: MediaType
    ): Promise<IMessage> {
        try {
            if (!content.trim() && !mediaUrl?.trim()) {
                throw new CustomError(
                    "Message content cannot be empty",
                    StatusCode.BAD_REQUEST
                );
            }

            console.log("service ==>", mediaUrl);

            return await this._messageRepository.saveMessage(
                senderId,
                receiverId,
                senderModel,
                receiverModel,
                content,
                type,
                mediaUrl,
                mediaType
            );
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                throw new CustomError(
                    "Error in send message service",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async getChatHistory(
        userId1: Types.ObjectId,
        userId2: Types.ObjectId
    ): Promise<IMessage[]> {
        try {
            return await this._messageRepository.getMessagesBetweenUsers(
                userId1,
                userId2
            );
        } catch (error) {
            console.error("ChatService getChatHistory error:", error);
            throw error;
        }
    }

    async getInboxForUser(
        userId: Types.ObjectId,
        lookupModel: "User" | "Doctor"
    ): Promise<ChatInboxItemDTO[]> {
        try {
            return await this._messageRepository.getInbox(userId, lookupModel);
        } catch (error) {
            throw error instanceof CustomError
                ? error
                : new CustomError(
                    "Unable to fetch chat inbox",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
        }
    }

    async markMessagesAsRead(
        senderId: Types.ObjectId,
        receiverId: Types.ObjectId
    ): Promise<void> {
        return this._messageRepository.markMessagesAsRead(senderId, receiverId);
    }

    async deleteMessage(messageId: Types.ObjectId): Promise<void> {
        console.log("serviecee=-", messageId);

        return this._messageRepository.markMessageAsDeleted(messageId);
    }
}

export default ChatService;

import { Types } from "mongoose";
import { IMessage, MediaType } from "../../../model/chat/message";
import { ChatInboxItemDTO, firstChatDTO } from "../../../types/chat";

export interface IChatService {
  sendMessage(
    senderId: Types.ObjectId,
    receiverId: Types.ObjectId,
    senderModel: "User" | "Doctor",
    receiverModel: "User" | "Doctor",
    content: string,
    type: "text" | "image" | "file",
    mediaUrl?: string,
    mediaType?: MediaType
  ): Promise<IMessage>;

  getChatHistory(
    userId1: Types.ObjectId,
    userId2: Types.ObjectId
  ): Promise<IMessage[]>;

  getInboxForUser(
    userId: Types.ObjectId,
    lookupModel: "User" | "Doctor"
  ): Promise<ChatInboxItemDTO[]>;

  markMessagesAsRead(
    senderId: Types.ObjectId,
    receiverId: Types.ObjectId
  ): Promise<void>;

  deleteMessage(messageId: Types.ObjectId): Promise<void>;
}

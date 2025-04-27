import { Types } from "mongoose";
import { IMessage, MediaType } from "../../../model/chat/message";
import { ChatInboxItemDTO } from "../../../types/chat";


export interface IMessageRepository{

    saveMessage(
        senderId: Types.ObjectId,
        receiverId: Types.ObjectId,
        senderModel: "User" | "Doctor",
        receiverModel: "User" | "Doctor",
        content: string,
        type: "text" | "image" | "file",
        mediaUrl?: string,
        mediaType?: MediaType
      ): Promise<IMessage>;
      


    getMessagesBetweenUsers(
        userId1: Types.ObjectId,
        userId2: Types.ObjectId
      ): Promise<IMessage[]>;


      getInbox(userId: Types.ObjectId,lookupModel: "User" | "Doctor"): Promise<ChatInboxItemDTO[]>;


      markMessagesAsRead(senderId: Types.ObjectId, receiverId: Types.ObjectId): Promise<void> 


}
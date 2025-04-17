import { Types } from "mongoose";
import { IMessage } from "../../../model/chat/message";
import { ChatInboxItemDTO } from "../../../types/chat";


export interface IMessageRepository{

    saveMessage(
        senderId: Types.ObjectId,
        receiverId: Types.ObjectId,
        senderModel: "User" | "Doctor",
        receiverModel: "User" | "Doctor",
        content: string,
        type: "text" | "image" | "file"
      ): Promise<IMessage>;
      


    getMessagesBetweenUsers(
        userId1: Types.ObjectId,
        userId2: Types.ObjectId
      ): Promise<IMessage[]>;


      getInbox(userId: Types.ObjectId): Promise<ChatInboxItemDTO[]>;





}
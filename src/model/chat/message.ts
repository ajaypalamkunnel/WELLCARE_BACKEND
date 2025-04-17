import mongoose, { Schema, Document, ObjectId } from "mongoose";

export type MessageType = "text" | "image" | "file";
export interface IMessage extends Document {
    senderId: ObjectId;
    senderModel: "User" | "Doctor";
    receiverId: ObjectId;
    receiverModel: "User" | "Doctor";
    content: string;
    type: MessageType;
    isRead: boolean;
    createdAt: Date;
  }
  
  const MessageSchema = new Schema<IMessage>(
    {
      senderId: { type: Schema.Types.ObjectId, required: true },
      senderModel: { type: String, required: true, enum: ["User", "Doctor"] },
      receiverId: { type: Schema.Types.ObjectId, required: true },
      receiverModel: { type: String, required: true, enum: ["User", "Doctor"] },
      content: { type: String, required: true },
      type: { type: String, enum: ["text", "image", "file"], default: "text" },
      isRead: { type: Boolean, default: false },
    },
    {
      timestamps: { createdAt: true, updatedAt: false },
    }
  );

const Message = mongoose.model<IMessage>("Message", MessageSchema);

export default Message;

import mongoose, { Schema, Document, ObjectId } from "mongoose";

export type MessageType = "text" | "image" | "file" | "video";
export type MediaType = "image" | "video" | "file"
export interface IMessage extends Document {
  senderId: ObjectId;
  senderModel: "User" | "Doctor";
  receiverId: ObjectId;
  receiverModel: "User" | "Doctor";
  content: string;
  type: MessageType;
  mediaUrl: string;
  mediaType: MediaType;
  isRead: boolean;
  isDeleted:boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, required: true },
    senderModel: { type: String, required: true, enum: ["User", "Doctor"] },
    receiverId: { type: Schema.Types.ObjectId, required: true },
    receiverModel: { type: String, required: true, enum: ["User", "Doctor"] },
    content: { type: String },
    type: { type: String, enum: ["text", "image", "file", "video"], default: "text" },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ["image", "video", "file"] },
    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Message = mongoose.model<IMessage>("Message", MessageSchema);

export default Message;

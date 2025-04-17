import { Types } from "mongoose";
import Message, { IMessage } from "../../../model/chat/message";
import { BaseRepository } from "../../base/BaseRepository";
import { IMessageRepository } from "../../interfaces/chat/IMessageRepository";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";
import { ChatInboxItemDTO } from "../../../types/chat";

class MessageRepository extends BaseRepository<IMessage> implements IMessageRepository {

    constructor() {
        super(Message)
    }

    async saveMessage(
        senderId: Types.ObjectId,
        receiverId: Types.ObjectId,
        senderModel: "User" | "Doctor",
        receiverModel: "User" | "Doctor",
        content: string,
        type: "text" | "image" | "file"
    ): Promise<IMessage> {
        try {
            const message = new Message({
                senderId,
                receiverId,
                senderModel,
                receiverModel,
                content,
                type,
            });

            return await message.save();
        } catch (error) {
            console.error("❌ Error saving message:", error);
            throw new CustomError("Failed to save message", StatusCode.INTERNAL_SERVER_ERROR);
        }
    }



    async getMessagesBetweenUsers(userId1: Types.ObjectId, userId2: Types.ObjectId): Promise<IMessage[]> {

        try {


            return await Message.find({
                $or: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 }

                ]
            }).sort({ createdAt: 1 })

        } catch (error) {
            console.error(" Error fetching messages:", error);
            throw new CustomError("Failed to load chat history", StatusCode.INTERNAL_SERVER_ERROR);

        }
    }



    async getInbox(userId: Types.ObjectId,lookupModel: "User" | "Doctor"): Promise<ChatInboxItemDTO[]> {
        try {


            const latestMessages = await Message.aggregate([
                {
                    $match: {
                        $or: [
                            { senderId: userId },
                            { receiverId: userId }
                        ]
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $eq: ["$senderId", userId] },
                                "$receiverId",
                                "$senderId"
                            ]
                        },
                        lastMessage: { $first: "$content" },
                        lastMessageTime: { $first: "$createdAt" },
                        isRead: { $first: "$isRead" },
                    }
                },
                {
                    $lookup: {
                        from: lookupModel === "Doctor" ? "doctors" : "users", // will match either user or doctor dynamically
                        localField: "_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" },
                {
                    $project: {
                        _id: "$user._id",
                        fullName: "$user.fullName",
                        profileUrl: "$user.profileUrl",
                        lastMessage: 1,
                        lastMessageTime: 1,
                    }
                }
            ]);

            // Compute unread count per user
            const withUnreadCounts = await Promise.all(latestMessages.map(async (chat) => {
                const count = await Message.countDocuments({
                    senderId: chat._id,
                    receiverId: userId,
                    isRead: false,
                });

                return {
                    ...chat,
                    unreadCount: count,
                };
            }));

            return withUnreadCounts;

        } catch (error) {
            console.error(" Error in getInbox:", error);
            throw new CustomError("Failed to fetch inbox", StatusCode.INTERNAL_SERVER_ERROR);

        }
    }

}

export default MessageRepository
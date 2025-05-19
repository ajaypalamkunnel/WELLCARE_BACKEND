import { Types } from "mongoose";
import NotificationModel from "../../model/notification/notificationModel";

export const saveNotification = async ({
  userId,
  userRole,
  title,
  message,
  link,
  type = "system",
}: {
  userId: string;
  userRole: "Doctor" | "user";
  title: string;
  message: string;
  link?: string;
  type?: "appointment" | "system" | "message";
}) => {
  const notification = await NotificationModel.create({
    userId: new Types.ObjectId(userId),
    userRole,
    title,
    message,
    link,
    type,
  });
  // console.log("✅ Notification created:", notification);

  return notification

};

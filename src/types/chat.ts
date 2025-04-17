export interface ChatInboxItemDTO {
    _id: string;
    fullName: string;
    profileUrl?: string;
    isOnline?: boolean;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
  }
  


export interface firstChatDTO{
    _id: string;
    fullName: string;
    profileImage: string;
}


export interface ChatUser {
    _id: string;
    fullName: string;
    isOnline: boolean;
    profileImage: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
  }
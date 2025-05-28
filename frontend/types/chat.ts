// API response Chat
export interface ResChat {
  groupId: number;
  userId: number;
  image: string;
  fullName: string;
  unreadcount: number;
  lastmessagedate: string;
}

// React Chat Interface
export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isGroup: boolean;
  isNew: boolean;
  isOnline?: boolean;
}
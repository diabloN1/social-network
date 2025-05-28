import { User } from "./user";

export interface Message {
  id: number;
  sender_id: number;
  recipient_id?: number;
  group_id?: number;
  text: string;
  created_at: string;
  isOwned: boolean;
  user: User;
}

export interface AddMessageEvent {
  type: string;
  message: Message;
  isOwned: boolean;
}

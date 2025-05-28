import { User } from "./user";

export interface GroupEvent {
  id: number;
  title: string;
  description: string;
  user_id: number;
  group_id: number;
  date: string;
  place: string;
  option_1: string;
  option_2: string;
  creation_date: string;
  user: User;
  current_option?: string;
  opt1_users?: User[] | null;
  opt2_users?: User[] | null;
}

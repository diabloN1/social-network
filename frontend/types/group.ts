import { GroupEvent } from "./event";
import { Post } from "./post";
import { User } from "./user";

export interface Group {
  id: number;
  title: string;
  description: string;
  image: string;
  owner_id: number;
  is_owner: boolean;
  is_accepted: boolean;
  is_pending?: boolean;
  members: User[];
  posts: Post[];
  events: GroupEvent[];
}
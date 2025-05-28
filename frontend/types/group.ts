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
  new_event: boolean;
}

export interface GroupInvite {
  id: number;
  group_id: number;
  user_id: number;
  creation_date: string;
  group: Group;
  user: User;
}

export interface JoinRequest {
  id: number;
  title: string;
  description: string;
  image: string;
  creation_date: string;
  is_accepted: boolean;
  is_owner: boolean;
  members: User[];
}

export interface GroupsData {
  all: Group[];
  error: string;
  group_invites: GroupInvite[] | null;
  join_requests: JoinRequest[] | null;
}
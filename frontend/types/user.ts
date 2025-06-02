import { Follow } from "./follow";
import { Post } from "./post";

export interface User {
  id: number;
  username?: string;
  firstname: string;
  lastname: string;
  nickname: string;
  avatar?: string;
  online?: boolean;
  isaccepted?: boolean;
}

export interface Profile {
  id: number;
  firstname: string;
  lastname: string;
  nickname: string;
  email: string;
  birth: string;
  avatar: string;
  about: string;
  online: boolean;
  isprivate: boolean;
  isaccepted: boolean;
  follow: Follow;
  posts: Post[];
  followers: User[] | null;
  following: User[] | null;
  currentuser: boolean;
  totalnotifications: number;
  lastmessagedate: string;
}

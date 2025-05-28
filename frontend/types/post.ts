import { Comment } from "./comment";
import { User } from "./user";

export interface Post {
  id: number;
  user: User;
  user_id?: number;
  image?: string;
  caption?: string;
  privacy?: string;
  creation_date?: string;
  reactions?: Reaction;
  comments?: Comment[];
}

export interface Reaction {
    likes: number;
    dislikes: number;
    userReaction: boolean | null;
    isReacting?: boolean;
}

export interface Comment {
  id: number;
  author: string;
  image?: string;
  user: {
    name: string;
    avatar: string;
  };
  text: string;
  creation_date: string;
  user_id?: number;
  user_avatar?: number;
}

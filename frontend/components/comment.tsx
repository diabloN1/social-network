"use client";

import { Comment as CommentType } from "@/types/comment";
import Image from "next/image";

interface CommentProps {
  comment: CommentType;
  postID: number;
}

export default function Comment({ comment, postID }: CommentProps) {
  console.log("COMMENT DATA ----------------------", comment);
  return (
    <div className="post-comment">
      <div className="comment-user-avatar">
        <Image
          src={
            comment.user_avatar
              ? `http://localhost:8080/getProtectedImage?type=avatars&id=${
                  comment.user_id
                }&path=${encodeURIComponent(comment.user_avatar)}`
              : "/icons/placeholder.svg"
          }
          alt="Comment image"
          className="comment-image"
          width={200}
          height={400}
          unoptimized
        />
      </div>
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-user-name">{comment.author}</span>
          {comment.text && <span className="comment-text">{comment.text}</span>}
        </div>

        {comment.image && (
          <div className="comment-image-container">
            <Image
              src={
                comment.image
                  ? `http://localhost:8080/getProtectedImage?type=post-comments&id=${postID}&path=${encodeURIComponent(
                      comment.image
                    )}`
                  : "/icons/placeholder.svg"
              }
              alt="Comment image"
              className="comment-image"
              width={200}
              height={400}
              unoptimized
            />
          </div>
        )}

        <div className="comment-timestamp">{comment.creation_date}</div>
      </div>
    </div>
  );
}

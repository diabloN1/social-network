"use client";

import { Comment as CommentType } from "@/types/comment";
import Image from "next/image";

interface CommentProps {
  comment: CommentType;
  postID: number;
}

export default function Comment({ comment, postID }: CommentProps) {
  return (
    <div className="post-comment">
      <div className="comment-user-avatar">
        <Image
          src="/icons/placeholder.svg"
          alt="User avatar"
          width={30}
          height={30}
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
                  ? `http://localhost:8080/getProtectedImage?type=posts&id=${postID}&path=${encodeURIComponent(
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

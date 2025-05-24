"use client";

import Image from "next/image";

interface CommentProps {
  comment: {
    id: number;
    author: string;
    text: string;
    image: string;
    creation_date: string;
    user_id?: number;
  };
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
            <img
              src={
                comment.image
                  ? `http://localhost:8080/getProtectedImage?type=posts&id=${postID}&path=${encodeURIComponent(
                      comment.image
                    )}`
                  : "/icons/placeholder.svg"
              }
              alt="Comment image"
              className="comment-image"
            />
            {/* <img
              src={`http://localhost:8080/getProtectedImage?type=comments&id=${
                comment.id
              }&path=${encodeURIComponent(comment.image)}`}
              alt="Comment image"
              className="comment-image"
            /> */}
          </div>
        )}

        <div className="comment-timestamp">{comment.creation_date}</div>
      </div>
    </div>
  );
}

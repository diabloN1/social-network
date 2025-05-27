"use client";

interface CommentProps {
  comment: {
    id: number;
    author: string;
    text: string;
    image: string;
    creation_date: string;
    user_id: number;
    user_avatar?: number;
  };
  postID: number;
}

export default function GroupComment({ comment, postID }: CommentProps) {
  console.log("------------------------");
  console.log("------------------------");
  console.log("------------------------");
  console.log("------------------------");
  console.log(comment);
  return (
    <div className="post-comment">
      <div className="comment-user-avatar">
        <img
          src={
            comment.user_avatar
              ? `http://localhost:8080/getProtectedImage?type=avatars&id=${
                  comment.user_id
                }&path=${encodeURIComponent(comment.user_avatar)}`
              : "/icons/placeholder.svg"
          }
          alt={`${comment.author}'s avatar`}
          className="user-avatar-small"
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
                  ? `http://localhost:8080/getProtectedImage?type=group-posts&id=${postID}&path=${encodeURIComponent(
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

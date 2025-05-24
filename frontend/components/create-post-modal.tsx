"use client";

import type React from "react";
import { useState } from "react";
import { uploadFile } from "@/api/auth/uploadFile";

interface CreatePostModalProps {
  onClose: () => void;
  onSubmit: (post: {
    image: string;
    caption: string;
    privacy?: string;
    groupId?: number;
  }) => void;
  groupId?: number;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  onClose,
  onSubmit,
  groupId,
}) => {
  const [caption, setCaption] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = "";

      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        imageUrl = await uploadFile(formData, groupId ? "/group-posts" : "/posts");
      }

      const data = groupId
        ? {
            image: imageUrl,
            caption,
            groupId,
          }
        : {
            image: imageUrl,
            caption,
            privacy,
          };

      onSubmit(data);
    } catch (err) {
      alert(err);
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Post</h2>
          <button className="modal-close" onClick={onClose}>
            X
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Upload Image</label>
              <div className="file-input-wrapper">
                <label className="file-input-label">
                  Choose Image or GIF
                  <input
                    type="file"
                    className="file-input"
                    accept="image/*,.gif"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {imagePreview && (
                <div className="image-preview">
                  <img
                    src={imagePreview || "/icons/placeholder.svg"}
                    alt="Preview"
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="caption">
                Caption
              </label>
              <textarea
                id="caption"
                className="form-textarea"
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            {!groupId ? (
              <div className="form-group">
                <label className="form-label" htmlFor="privacy">
                  Privacy
                </label>
                <select
                  id="privacy"
                  className="form-select"
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                >
                  <option value="public">Public - Everyone can see</option>
                  <option value="almost-private">
                    Almost Private - Only followers can see
                  </option>
                  <option value="private">
                    Private - Only selected followers can see
                  </option>
                </select>
              </div>
            ) : null}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="create-post-btn"
              style={{
                backgroundColor: "var(--input-bg)",
                marginRight: "10px",
              }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="create-post-btn">
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;

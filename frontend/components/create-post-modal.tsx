"use client";

import type React from "react";
import { useState } from "react";
import { uploadFile } from "@/helpers/uploadFile";
import "./styles/create-post-modal.css";
// import Popup from "@/app/app/popup";
import Image from "next/image";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [popup, setPopup] = useState<{
  //   message: string;
  //   status: "success" | "failure";
  // } | null>(null);

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
    setIsSubmitting(true);

    try {
      let imageUrl = "";

      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        imageUrl = await uploadFile(
          formData,
          groupId ? "/group-posts" : "/posts"
        );
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
      // setPopup({ message: "Failed to load comments.", status: "failure" });

      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Post</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Upload Image</label>
              <div className="file-input-wrapper">
                <label className="file-input-label">
                  {image ? "Change Image" : "Choose Image or GIF"}
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
                  <Image
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    width={600}
                    height={200}
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
                disabled={isSubmitting}
              />
            </div>

            {!groupId && (
              <div className="form-group">
                <label className="form-label" htmlFor="privacy">
                  Privacy
                </label>
                <select
                  id="privacy"
                  className="form-select"
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                  disabled={isSubmitting}
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
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="create-post-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-post-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Post"}
            </button>
          </div>
        </form>
      </div>
      {/* {popup && (
        <Popup
          message={popup.message}
          status={popup.status}
          onClose={() => setPopup(null)}
        />
      )} */}
    </div>
  );
};

export default CreatePostModal;

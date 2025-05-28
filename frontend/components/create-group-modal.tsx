"use client";

import type React from "react";
import { useState } from "react";
import { uploadFile } from "@/api/auth/uploadFile";
import Popup from "@/app/app/popup";
import Image from "next/image";

interface CreateGroupModalProps {
  onClose: () => void;
  onSubmit: (group: {
    image: string;
    title: string;
    description: string;
  }) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [popup, setPopup] = useState<{
    message: string;
    status: "success" | "failure";
  } | null>(null);
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
        imageUrl = await uploadFile(formData, "/avatars");
      }

      onSubmit({
        image: imageUrl,
        title,
        description,
      });
    } catch (err) {
      setPopup({ message: `${err}`, status: "failure" });
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Group</h2>
          <button className="modal-close" onClick={onClose}>
            X
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Upload Group Image</label>
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
                  <Image
                    src={imagePreview || "/icons/placeholder.svg"}
                    alt="Preview"
                    width={40}
                    height={40}
                    unoptimized
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Group Title
              </label>
              <input
                id="title"
                type="text"
                className="form-input"
                placeholder="Enter group title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                className="form-textarea"
                placeholder="Write a group description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
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
              Create Group
            </button>
          </div>
        </form>
      </div>
      {popup && (
        <Popup
          message={popup.message}
          status={popup.status}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
};

export default CreateGroupModal;

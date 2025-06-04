"use client";

import type React from "react";
import { useState } from "react";
import { uploadFile } from "@/api/auth/uploadFile";
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
  const [disableButton, setDisableButton] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  const titleRegex = /^[a-zA-Z0-9\s\-]{3,50}$/;

  const validateInputs = () => {
    const newErrors: { title?: string; description?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Group title is required.";
    } else if (!titleRegex.test(title)) {
      newErrors.title =
        "Title must be 3-50 characters and contain only letters, numbers, spaces, or dashes.";
    }

    if (description.length > 300) {
      newErrors.description = "Description must be 300 characters or less.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    if (!validateInputs()) return;

    setDisableButton(true);
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
      console.error(err);
    } finally {
      setDisableButton(false);
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
              {errors.title && <p className="form-error">{errors.title}</p>}
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
              {errors.description && (
                <p className="form-error">{errors.description}</p>
              )}
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
            <button
              type="submit"
              className="create-post-btn"
              disabled={disableButton}
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;

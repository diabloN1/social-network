"use client";

import type React from "react";
import { useState, useRef } from "react";
import Image from "next/image";
// import addComment from "@/api/posts/addComment";
import { uploadFile } from "@/helpers/uploadFile";
// import Popup from "@/home/home/popup";
import { useGlobalAPIHelper } from "@/helpers/GlobalAPIHelper";

interface CommentFormProps {
  postId: number;
  onCommentAdded: () => void;
  disabled?: boolean;
}

export default function CommentForm({
  postId,
  onCommentAdded,
  disabled,
}: CommentFormProps) {
  const [newComment, setNewComment] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { apiCall } = useGlobalAPIHelper();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newComment.trim() === "" && !selectedImage) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      let filename = "";

      if (selectedImage) {
        const formData = new FormData();
        formData.append("file", selectedImage);

        filename = await uploadFile(formData, "post-comments");
      }

      // Add comment
      await apiCall(
        {
          type: "add-comment",
          data: {
            postId,
            text: newComment.trim(),
            image: filename || "",
          },
        },
        "POST",
        "addComment"
      );

      // Reset form
      setNewComment("");
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Notify parent component
      onCommentAdded();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      {imagePreview && (
        <div className="image-preview-container">
          <div className="image-preview">
            <Image
              src={imagePreview || "/placeholder.svg"}
              alt="Preview"
              className="preview-image"
              width={40}
              height={40}
            />

            <button
              type="button"
              className="remove-image-btn"
              onClick={removeImage}
              aria-label="Remove image"
            >
              <Image src="/icons/x.svg" alt="remove" width={16} height={16} />
            </button>
          </div>
        </div>
      )}

      <div className="comment-input-container">
        <input
          type="text"
          className="comment-input"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={disabled || isSubmitting}
        />

        <div className="comment-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: "none" }}
            disabled={disabled || isSubmitting}
          />

          <button
            type="button"
            className="image-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isSubmitting}
            aria-label="Add image"
          >
            <Image
              src="/icons/attachment.svg"
              alt="camera"
              width={20}
              height={20}
            />
          </button>

          <button
            type="submit"
            className="comment-submit-btn"
            disabled={
              disabled ||
              isSubmitting ||
              (newComment.trim() === "" && !selectedImage)
            }
          >
            <Image src="/icons/send.svg" alt="send" width={16} height={16} />
            <span style={{ marginLeft: "5px" }}>
              {isSubmitting ? "Sending..." : "Send"}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}

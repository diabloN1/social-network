"use client"

import type React from "react"
import { useState, useRef } from "react"

interface CreatePostModalProps {
  onClose: () => void
  onSubmit: (post: {
    image: string
    caption: string
    privacy: string
  }) => void
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onSubmit }) => {
  const [caption, setCaption] = useState("")
  const [privacy, setPrivacy] = useState("public")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      image: imagePreview || "/placeholder.svg?height=500&width=500",
      caption,
      privacy,
    })
  }

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
                    ref={fileInputRef}
                  />
                </label>
              </div>

              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" />
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

            <div className="form-group">
              <label className="form-label" htmlFor="privacy">
                Privacy
              </label>
              <select id="privacy" className="form-select" value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
                <option value="public">Public - Everyone can see</option>
                <option value="almost-private">Almost Private - Only followers can see</option>
                <option value="private">Private - Only selected followers can see</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="create-post-btn"
              style={{ backgroundColor: "var(--input-bg)", marginRight: "10px" }}
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
  )
}

export default CreatePostModal

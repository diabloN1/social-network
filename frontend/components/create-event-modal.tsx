"use client";

import type React from "react";
import { useState } from "react";

interface CreateEventModalProps {
  onClose: () => void;
  onSubmit: (event: {
    title: string;
    description: string;
    option1: string;
    option2: string;
    date: string;
    place: string;
  }) => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [date, setDate] = useState("");
  const [place, setPlace] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      option1,
      option2,
      date,
      place,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Event</h2>
          <button className="modal-close" onClick={onClose}>
            X
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Event Title
              </label>
              <input
                id="title"
                type="text"
                className="form-input"
                placeholder="Enter event title"
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
                placeholder="Write an event description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="option1">
                Option 1
              </label>
              <input
                id="option1"
                type="text"
                className="form-input"
                placeholder="First option"
                value={option1}
                onChange={(e) => setOption1(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="option2">
                Option 2
              </label>
              <input
                id="option2"
                type="text"
                className="form-input"
                placeholder="Second option"
                value={option2}
                onChange={(e) => setOption2(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                type="datetime-local"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="place">
                Place
              </label>
              <input
                id="place"
                type="text"
                className="form-input"
                placeholder="Location of the event"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
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
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateEventModal;

import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";

const mockImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80"
];

const initialListing = {
  name: "Cozy Mountain Retreat",
  address: "123 Alpine Lane, Lake Tahoe, CA",
  maxOccupancy: 6,
  details: "A charming cabin with breathtaking views.",
  additionalDetails: "Pets allowed. 10min from ski lift."
};

export default function EditListing() {
  const [listing, setListing] = useState(initialListing);
  const [images, setImages] = useState(mockImages);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setListing((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveImage = (idx) => {
    setImages((imgs) => imgs.filter((_, i) => i !== idx));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImages((imgs) => [...imgs, ...previews]);
  };

  const handleEditorChange = (content) => {
    setListing((prev) => ({
      ...prev,
      additionalDetails: content
    }));
  };

  // Use your TinyMCE Cloud API key from .env
  const tinymceApiKey = process.env.REACT_APP_TINYMCE_API_KEY;

  return (
    <div>
      <div className="card">
        <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 32 }}>
          Edit Listing
        </h1>
        <form>
          <div className="form-field">
            <label className="form-label" htmlFor="name">Listing Name</label>
            <input
              className="form-input"
              id="name"
              name="name"
              value={listing.name}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="address">Address</label>
            <input
              className="form-input"
              id="address"
              name="address"
              value={listing.address}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="maxOccupancy">Maximum Occupancy</label>
            <input
              type="number"
              className="form-input"
              id="maxOccupancy"
              name="maxOccupancy"
              min="1"
              value={listing.maxOccupancy}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="details">Details</label>
            <textarea
              className="form-textarea"
              id="details"
              name="details"
              value={listing.details}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="additionalDetails">Additional Details</label>
            <Editor
              id="additionalDetails"
              value={listing.additionalDetails}
              apiKey={tinymceApiKey}
              init={{
                menubar: false,
                height: 180,
                toolbar:
                  "undo redo | bold italic underline | bullist numlist outdent indent | removeformat",
                plugins: "lists",
                statusbar: false,
                branding: false,
                content_style: "body {font-family:inherit; font-size:1rem;}"
              }}
              onEditorChange={handleEditorChange}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Images</label>
            <div className="form-image-row">
              {images.map((img, i) => (
                <div className="image-thumb" key={img}>
                  <img
                    src={img}
                    alt={`Listing Image ${i + 1}`}
                    draggable={false}
                  />
                  <button
                    type="button"
                    className="remove-img-btn"
                    title="Remove image"
                    onClick={() => handleRemoveImage(i)}
                    tabIndex={0}
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="upload-img-area" tabIndex={0} role="button">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
                + Upload
              </label>
            </div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              Hover over an image to remove.
            </div>
          </div>
          <button className="save-btn" type="submit" disabled>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
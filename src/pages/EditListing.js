import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useParams } from "react-router-dom";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import supabase from "../supabaseClient";

// Utility to update the cover_image_url field for the listing in Supabase
async function updateCoverImageUrl(listingId, coverUrl) {
  await supabase
    .from('listings')
    .update({ cover_image_url: coverUrl })
    .eq('id', listingId);
}


const initialListing = {
  name: "Cozy Mountain Retreat",
  address: "123 Alpine Lane, Lake Tahoe, CA",
  maxOccupancy: 6,
  details: "A charming cabin with breathtaking views.",
  additionalDetails: "Pets allowed. 10min from ski lift.",
};

function readFileAsync(file) {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Cropper image utility: produces cropped square as blob
async function getCroppedImg(imageSrc, croppedAreaPixels) {
  const img = new window.Image();
  img.src = imageSrc;
  await new Promise((r) => (img.onload = r));
  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    img,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Canvas is empty"));
      else resolve(blob);
    }, "image/jpeg");
  });
}

export default function EditListing() {
  const [listing, setListing] = useState(initialListing);
  const [images, setImages] = useState([]);

  // React-router: get listingId from URL params
  const { id: listingId } = useParams();

  // Load images from Supabase listing_images table on mount/listingId change
  React.useEffect(() => {
    async function fetchImages() {
      if (!listingId) return;
      const { data, error } = await supabase
        .from("listing_images")
        .select("image_url")
        .eq("listing_id", listingId)
        .order("order", { ascending: true });
      if (!error && Array.isArray(data)) {
        setImages(data.map(img => img.image_url));
      }
    }
    fetchImages();
  }, [listingId]);

  // Cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropping, setCropping] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setListing((prev) => ({ ...prev, [name]: value }));
  };

  // Remove image and update cover_image_url
  const handleRemoveImage = async (idx) => {
    // Remove image from frontend state
    setImages((imgs) => {
      const newImgs = imgs.filter((_, i) => i !== idx);
      return newImgs;
    });

    // Get image to remove (by idx in current images state)
    const imgsNow = images;
    const removeImageUrl = imgsNow[idx];

    // Remove from listing_images table
    if (removeImageUrl && listingId) {
      await supabase
        .from('listing_images')
        .delete()
        .eq('listing_id', listingId)
        .eq('image_url', removeImageUrl);

      // Remove from Supabase Storage bucket
      // Convert image_url to storage key (strip full publicUrl if necessary)
      // Assuming image_url is in form `${listingId}/${filename}` or a full URL
      let storagePath = removeImageUrl;
      if (/https?:\/\//.test(removeImageUrl)) {
        const urlParts = removeImageUrl.split('/');
        const idx = urlParts.findIndex(p => p === 'listing-images');
        if (idx !== -1) {
          storagePath = urlParts.slice(idx + 1).join('/');
        }
      }
      await supabase
        .storage
        .from('listing-images')
        .remove([storagePath]);
    }

    // Re-fetch remaining images to get current order (and reflect any async changes)
    const { data: newImageRows, error } = await supabase
      .from('listing_images')
      .select('image_url')
      .eq('listing_id', listingId)
      .order('order', { ascending: true });
    const newImgsArr = (newImageRows || []).map((img) => img.image_url);

    // Update orders
    await Promise.all(
      newImgsArr.map((imgUrl, newOrder) =>
        supabase
          .from('listing_images')
          .update({ order: newOrder })
          .eq('listing_id', listingId)
          .eq('image_url', imgUrl)
      )
    );

    // Update cover_image_url field to new first image (or null if none)
    await updateCoverImageUrl(listingId, newImgsArr[0] || null);

    // Sync frontend images state
    setImages(newImgsArr);
  };

  // ---- Cropping Logic ----
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    // Always crop one at a time for simplicity
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setUploading(false);

    // Start with the first file. Can extend to queue later
    const file = files[0];
    setUploadQueue(files.slice(1));
    const imgBase64 = await readFileAsync(file);
    setImageSrc(imgBase64);
    setCropping(true);
  };

  const handleCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      // Upload to Supabase Storage (listing-images bucket, by listingId folder)
      const filename = `${Date.now()}_image.jpg`;
      const filePath = `${listingId}/${filename}`;
      let { error: uploadError } = await supabase
        .storage
        .from('listing-images')
        .upload(filePath, croppedBlob, { contentType: 'image/jpeg' });
      if (uploadError) throw uploadError;

      // Get public URL (defensive: only if filePath and listingId valid)
      let publicUrl = "";
      if (listingId && filePath) {
        const { data: urlData } = supabase
          .storage
          .from('listing-images')
          .getPublicUrl(filePath);
        publicUrl = urlData?.publicUrl || "";
      } else {
        alert("Error: listingId or filePath missing when creating public URL.");
      }

      // Insert row into listing_images table
      const orderIdx = images.length;
      let { error: insertError } = await supabase
        .from('listing_images')
        .insert([{ listing_id: listingId, image_url: publicUrl, order: orderIdx }]);
      if (insertError) throw insertError;

      setImages((imgs) => {
        const newImgs = [...imgs, publicUrl];
        // If this is the first image, set as cover
        if (newImgs.length === 1) {
          updateCoverImageUrl(listingId, publicUrl);
        }
        return newImgs;
      });

      // Advance to next queued image, or close cropper
      if (uploadQueue.length > 0) {
        const next = uploadQueue[0];
        const nextBase64 = await readFileAsync(next);
        setUploadQueue(uploadQueue.slice(1));
        setImageSrc(nextBase64);
        setCropping(true);
      } else {
        setCropping(false);
        setImageSrc(null);
        setUploadQueue([]);
      }
      setCroppedAreaPixels(null);
    } catch (err) {
      alert("Image upload failed: " + (err.message || err.error_description));
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    setCropping(false);
    setImageSrc(null);
    setUploadQueue([]);
    setCroppedAreaPixels(null);
  };

  const handleEditorChange = (content) => {
    setListing((prev) => ({
      ...prev,
      additionalDetails: content,
    }));
  };

  const tinymceApiKey = process.env.REACT_APP_TINYMCE_API_KEY;

  return (
    <div>
      {/* Cropper Modal */}
      {cropping && imageSrc && (
        <div
          style={{
            position: "fixed",
            zIndex: 1000,
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 10,
              boxShadow: "0 4px 24px #2222",
              maxWidth: 420,
              width: "90vw",
            }}
          >
            <div
              style={{
                position: "relative",
                width: 320,
                height: 320,
                background: "#111",
              }}
            >
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div style={{ display: "flex", marginTop: 16, gap: 12 }}>
              <button
                onClick={handleCropCancel}
                type="button"
                style={{
                  fontWeight: 500,
                  background: "#ededed",
                  border: 0,
                  padding: "8px 18px",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                type="button"
                style={{
                  fontWeight: 500,
                  background: "#0a9",
                  color: "#fff",
                  border: 0,
                  padding: "8px 20px",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Crop & Add"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="card">
        <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 32 }}>
          Edit Listing
        </h1>
        <form>
          <div className="form-field">
            <label className="form-label" htmlFor="name">
              Listing Name
            </label>
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
            <label className="form-label" htmlFor="address">
              Address
            </label>
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
            <label className="form-label" htmlFor="maxOccupancy">
              Maximum Occupancy
            </label>
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
            <label className="form-label" htmlFor="details">
              Details
            </label>
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
            <label className="form-label" htmlFor="additionalDetails">
              Additional Details
            </label>
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
                content_style: "body {font-family:inherit; font-size:1rem;}",
              }}
              onEditorChange={handleEditorChange}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Images</label>
            <div className="form-image-row" style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {images.map((img, i) => (
                <div
                  className="image-thumb"
                  key={img + i}
                  style={{
                    width: 112,
                    height: 112,
                    borderRadius: 8,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    margin: 2,
                  }}
                >
                  <img
                    src={img}
                    alt={`Listing Image ${i + 1}`}
                    draggable={false}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      background: "#f2f2f2"
                    }}
                  />
                  <button
                    type="button"
                    className="remove-img-btn"
                    title="Remove image"
                    onClick={() => handleRemoveImage(i)}
                    tabIndex={0}
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 4,
                      background: "rgba(0,0,0,0.4)",
                      color: "#fff",
                      border: 0,
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      padding: 0,
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <label
                className="upload-img-area"
                tabIndex={0}
                role="button"
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: 8,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  margin: 2,
                  background: "#f2f2f2",
                  border: "2px dashed #aaa",
                  color: "#888",
                  fontSize: 34,
                  cursor: "pointer",
                  minWidth: 0,
                  minHeight: 0,
                  transition: "border-color 0.2s"
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
                <span style={{ userSelect: "none", fontWeight: 600, fontSize: 34, lineHeight: 0 }}>+</span>
              </label>
            </div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              All images will be cropped square. Hover over an image to remove.
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
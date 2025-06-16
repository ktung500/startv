import React from "react";
import { Link } from "react-router-dom";
import "./ListingCard.css";

// ListingCard: Shorter card, cost and max occupancy on the same line.
function ListingCard({ listing }) {
  return (
    <Link
      to={`/details/${listing.id}`}
      className="listing-card"
      tabIndex={0}
      aria-label={`View details for ${listing.short_description}`}
    >
      <div className="listing-image-wrapper">
        <img
          src={
            listing.cover_image_url && listing.cover_image_url.trim() !== ""
              ? listing.cover_image_url
              : "https://placehold.co/400x400"
          }
          alt={listing.short_description || "Property image"}
          className="listing-image"
          loading="lazy"
        />
      </div>
      <div className="listing-info">
        <div className="listing-title">{listing.short_description}</div>
        <div className="listing-location">
          {listing.city}, {listing.country}
        </div>
        <div className="listing-meta">
          <span>
            ${listing.cost_per_night}
            <span style={{ color: "#64748b", fontWeight: 400, marginLeft: 2 }}>
              /night
            </span>
          </span>
          <span>•</span>
          <span>Max Guests: {listing.max_occupancy}</span>
        </div>
      </div>
    </Link>
  );
}

export default ListingCard;
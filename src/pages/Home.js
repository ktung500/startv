
import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const properties = [
    {
      id: 1,
      title: "Modern City Apartment",
      price: "$250,000",
      location: "Downtown, City",
      image: "https://placehold.co/300x200",
      description: "A beautiful modern apartment in the heart of the city. Features include open plan living, high-end appliances, and city views.",
      bedrooms: 2,
      bathrooms: 2,
      area: "1,200 sqft",
      amenities: ["Parking", "Gym", "Pool", "Security"]
    },
    {
      id: 2,
      title: "Suburban Family Home",
      price: "$450,000",
      location: "Suburb Area, City",
      image: "https://placehold.co/300x200",
      description: "Spacious family home in a quiet suburban area. Perfect for families with a large backyard and modern facilities.",
      bedrooms: 4,
      bathrooms: 3,
      area: "2,500 sqft",
      amenities: ["Garden", "Garage", "Playground", "Storage"]
    },
    {
      id: 3,
      title: "Luxury Penthouse",
      price: "$750,000",
      location: "City Center",
      image: "https://placehold.co/300x200",
      description: "Luxurious penthouse with panoramic city views. High-end finishes and exclusive rooftop access.",
      bedrooms: 3,
      bathrooms: 3,
      area: "2,000 sqft",
      amenities: ["Terrace", "Concierge", "Spa", "Wine Cellar"]
    },
    {
      id: 4,
      title: "Cozy Studio Apartment",
      price: "$150,000",
      location: "University District",
      image: "https://placehold.co/300x200",
      description: "Perfect starter home or investment property near the university. Modern design with efficient use of space.",
      bedrooms: 1,
      bathrooms: 1,
      area: "500 sqft",
      amenities: ["Study Area", "Bike Storage", "Laundry", "Internet"]
    },
    {
      id: 5,
      title: "Waterfront Villa",
      price: "$950,000",
      location: "Coastal Area",
      image: "https://placehold.co/300x200",
      description: "Stunning waterfront property with private beach access. Luxury living at its finest with spectacular ocean views.",
      bedrooms: 5,
      bathrooms: 4,
      area: "3,500 sqft",
      amenities: ["Private Beach", "Infinity Pool", "Guest House", "Boat Dock"]
    },
    {
      id: 6,
      title: "Mountain Retreat",
      price: "$550,000",
      location: "Mountain View",
      image: "https://placehold.co/300x200",
      description: "Scenic mountain home with breathtaking views. Perfect for nature lovers and outdoor enthusiasts.",
      bedrooms: 3,
      bathrooms: 2,
      area: "1,800 sqft",
      amenities: ["Fireplace", "Hiking Trails", "Views", "Garage"]
    },
    {
      id: 7,
      title: "Urban Loft",
      price: "$350,000",
      location: "Arts District",
      image: "https://placehold.co/300x200",
      description: "Modern loft in the vibrant arts district. High ceilings and industrial charm throughout.",
      bedrooms: 1,
      bathrooms: 2,
      area: "1,100 sqft",
      amenities: ["High Ceilings", "Exposed Brick", "Art Space", "Rooftop"]
    },
    {
      id: 8,
      title: "Beachfront Condo",
      price: "$650,000",
      location: "Coastal Boulevard",
      image: "https://placehold.co/300x200",
      description: "Direct beach access from this modern condo. Perfect for beach lovers and sunset views.",
      bedrooms: 2,
      bathrooms: 2,
      area: "1,400 sqft",
      amenities: ["Beach Access", "Pool", "Gym", "Parking"]
    }
  ];

  const handleCardClick = (property) => {
    navigate(`/details/${property.id}`, { state: { property } });
  };
  const [data, setData] = useState([{}]);

  useEffect(() => {
    fetch("/properties").then(
      res => res.json()
    ).then (
      data=> {
        setData(data)
        console.log(data)
      }
    )
  }, [])

  return (

    <div className="home-container">
      <h1>Featured Properties</h1>
      <div className="property-scroll-area">
        {properties.map((property) => (
          <div 
            key={property.id} 
            className="property-card"
            onClick={() => handleCardClick(property)}
          >
            <img
              src={property.image}
              alt={property.title}
              className="property-image"
            />
            <div className="property-details">
              <div className="property-title">{property.title}</div>
              <div className="property-price">{property.price}</div>
              <div className="property-location">{property.location}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from uuid import uuid4
from datetime import datetime

app = Flask(__name__)
CORS(app)
# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy()
db.init_app(app)
ma = Marshmallow(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, unique=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(12), unique=True, nullable=True)

    def __repr__(self):
        return f'<User {self.name}>'

class Listings(db.Model):
    id = db.Column("id", db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    owner = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    cost_per_night = db.Column(db.Float, nullable=False)
    number_of_bedrooms = db.Column(db.Integer, nullable=False)
    number_of_bathrooms = db.Column(db.Integer, nullable=False)
    max_occupancy = db.Column(db.Integer, nullable=False)
    additional_details = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, name, description, owner, address, city, country, 
                 cost_per_night, number_of_bedrooms, number_of_bathrooms, 
                 max_occupancy, additional_details=None):
        self.name = name
        self.description = description
        self.owner = owner
        self.address = address
        self.city = city
        self.country = country
        self.cost_per_night = cost_per_night
        self.number_of_bedrooms = number_of_bedrooms
        self.number_of_bathrooms = number_of_bathrooms
        self.max_occupancy = max_occupancy
        self.additional_details = additional_details

# Listing schema
class ListingSchema(ma.Schema):
    class Meta:
        fields = ('id', 'name', 'description', 'owner', 'address', 'city', 
                 'country', 'cost_per_night', 'number_of_bedrooms', 
                 'number_of_bathrooms', 'max_occupancy', 'additional_details', 
                 'created_at', 'updated_at')

listing_schema = ListingSchema()
listings_schema = ListingSchema(many=True)

# Routes for user management
@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    try:
        new_user = User(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone')  # Phone is optional
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User created successfully', 'id': new_user.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'phone': user.phone
    } for user in users])

# Routes for listing
# Create a listing
@app.route('/api/listing', methods=['POST'])
def add_listing():
    data = request.json
    print("Received data:", data)  # For debugging
    try:
        new_listing = Listings(
            name=data['name'],
            description=data['description'],
            owner=data['owner'],
            address=data['address'],
            city=data['city'],
            country=data['country'],
            cost_per_night=float(data['cost_per_night']),
            number_of_bedrooms=int(data['number_of_bedrooms']),
            number_of_bathrooms=int(data['number_of_bathrooms']),
            max_occupancy=int(data['max_occupancy']),
            additional_details=data.get('additional_details')
        )
        db.session.add(new_listing)
        db.session.commit()
        return listing_schema.jsonify(new_listing)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Get All Listings
@app.route('/api/listing', methods=['GET'])
def get_listings():
    all_listings = Listings.query.all()
    result = listings_schema.dump(all_listings)
    return jsonify(result)

# Get a single Listing
@app.route('/api/listing/<id>', methods=['GET'])
def get_listing(id):
    listing = Listings.query.get(id)
    return listing_schema.jsonify(listing)

# Update a listing
@app.route('/api/listing/<id>', methods=['PUT'])
def update_listing(id):
    listing = Listings.query.get(id)
    data = request.json
    try:
        listing.name = data['name']
        listing.description = data['description']
        listing.owner = data['owner']
        listing.address = data['address']
        listing.city = data['city']
        listing.country = data['country']
        listing.cost_per_night = float(data['cost_per_night'])
        listing.number_of_bedrooms = int(data['number_of_bedrooms'])
        listing.number_of_bathrooms = int(data['number_of_bathrooms'])
        listing.max_occupancy = int(data['max_occupancy'])
        listing.additional_details = data.get('additional_details')
        db.session.commit()
        return listing_schema.jsonify(listing)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Delete a listing
@app.route('/api/listing/<id>', methods=['DELETE'])
def delete_listing(id):
    listing = Listings.query.get(id)
    db.session.delete(listing)
    db.session.commit()
    return listing_schema.jsonify(listing)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)

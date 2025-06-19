from flask import Flask, request, jsonify, render_template, redirect, url_for
from supabase import create_client, Client
from flask_cors import CORS
from uuid import uuid4
from datetime import datetime
from functools import wraps

app = Flask(__name__)
CORS(app)
SUPABASE_URL = "https://sfsvrdlaaaknguqoodnf.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmc3ZyZGxhYWFrbmd1cW9vZG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0NjU4MzAsImV4cCI6MjA1NjA0MTgzMH0.QTNfBzCSWk9E4JTkqhE92i-878570NHTFG5ulSPH7kY"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Authentication middleware
def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            print("Authentication header missing")
            return jsonify({"error": "Authorization header required"}), 401
        
        token = auth_header.replace('Bearer ', '')
        
        try:
            # Verify the token with Supabase
            user_response = supabase.auth.get_user(token)
            user = user_response.user
            if not user:
                print("Authentication invalid auth token")
                return jsonify({"error": "Invalid authentication token"}), 401
                
            # Add user to request context for use in the route
            request.user = user
            return f(*args, **kwargs)
                
        except Exception as e:
            print("Authentication error")
            return jsonify({"error": f"Authentication error: {str(e)}"}), 401
    
    return decorated

@app.route('/')
def home():
    return "Flask + Supabase API is running!"


# Get authorized guests for a listing (listing_access + profiles)
@app.route('/listing_access/<listing_id>', methods=['GET'])
def get_listing_access(listing_id):
    try:
        # Query listing_access table for given listing and join with profiles
        response = supabase.table('listing_access').select('*, profiles:user(full_name,email)').eq('listing', listing_id).execute()
        if hasattr(response, 'error') and response.error:
            return jsonify({"error": response.error.message}), 400

        access_records = []
        for record in response.data:
            if record.get('profiles'):
                access_records.append({
                    "user_id": record.get('user'),
                    "full_name": record['profiles'].get('full_name'),
                    "email": record['profiles'].get('email'),
                    "access_tier": record.get('access_tier')
                })
        return jsonify({"authorized": access_records}), 200
    except Exception as e:
        print(f"Error fetching listing access: {str(e)}")
        return jsonify({"error": str(e)}), 500
# Invite a guest to a listing
@app.route('/listing_access/invite', methods=['POST'])
@auth_required
def invite_guest():
    try:
        data = request.get_json()
        email = data.get('email')
        tier = data.get('tier')
        listing_id = data.get('listing_id')
        host_user = request.user

        # Validate input
        if not email or not tier or not listing_id:
            return jsonify({"error": "Email, tier, and listing_id are required"}), 400

        # Check if current user is the owner of the listing
        listing_resp = supabase.table('listings').select('*').eq('id', listing_id).execute()
        if not listing_resp.data:
            return jsonify({"error": "Listing not found"}), 404

        listing = listing_resp.data[0]
        if listing.get('owner') != host_user.id:
            return jsonify({"error": "You are not the owner of this listing"}), 403

        # Look up user by email in profiles table (public, now with email field)
        user_resp = supabase.table('profiles').select('id').eq('email', email).execute()
        if not user_resp.data:
            return jsonify({"error": "User with provided email not found in profiles"}), 404
        invitee_id = user_resp.data[0]['id']

        # Check for duplicate invitation
        already_invited = supabase.table('listing_access').select('id').eq('user', invitee_id).eq('listing', listing_id).execute()
        if already_invited.data and len(already_invited.data) > 0:
            return jsonify({"error": "This user already has access"}), 400

        # Insert access record
        insert_resp = supabase.table('listing_access').insert({
            "user": invitee_id,
            "listing": listing_id,
            "access_tier": tier
        }).execute()

        if hasattr(insert_resp, 'error') and insert_resp.error:
            return jsonify({"error": insert_resp.error.message}), 400

        return jsonify({"message": "Guest invited successfully"}), 201
    except Exception as e:
        print(f"Error inviting guest: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Example: Fetch all users from Supabase
@app.route('/users', methods=['GET'])
def get_users():
    response = supabase.table("users").select("*").execute()
    return jsonify(response.data)

# Example: Add a new user
@app.route('/users', methods=['POST'])
def add_user():
    data = request.json
    response = supabase.table("users").insert(data).execute()
    return jsonify(response.data)

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        response = supabase.auth.sign_up(email=email, password=password)

        if response.error:
            return f"Error: {response.error.message}"
        return redirect(url_for('index'))
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Authenticate the user with Supabase
    try:
        # Sign in the user with Supabase
        result = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        # if result.error:
        #     return jsonify({"error": result.error.message}), 400
        user_data = {
            "id": result.user.id,
            "email": result.user.email,
            "app_metadata": result.user.app_metadata if hasattr(result.user, 'app_metadata') else {}
        }
        session_data = {
            "access_token": result.session.access_token,
            "refresh_token": result.session.refresh_token,
            "expires_at": result.session.expires_at,
            "user": {
                "id": result.user.id,
                "email": result.user.email,
                "role": result.user.role
            }
        }
        # Return user and session data
        return jsonify({
            "message": "Login successful",
            "user": user_data,
            "session": session_data
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# LISTINGS ROUTES

# Create a new listing
@app.route('/listings', methods=['POST'])
@auth_required
def create_listing():
    try:
        user = request.user
        # Get listing data from request
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['short_description', 'description', 'address', 'city', 'country', 
                          'cost_per_night', 'number_of_bedrooms', 
                          'number_of_bathrooms', 'max_occupancy']
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Create listing object with owner set to authenticated user
        listing_data = {
            'short_description': data['short_description'],
            'description': data['description'],
            'owner': data['owner'],  # Set owner to authenticated user
            'address': data['address'],
            'city': data['city'],
            'country': data['country'],
            'cost_per_night': float(data['cost_per_night']),
            'number_of_bedrooms': int(data['number_of_bedrooms']),
            'number_of_bathrooms': int(data['number_of_bathrooms']),
            'max_occupancy': int(data['max_occupancy']),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Add optional fields if present
        if 'additional_details' in data:
            listing_data['additional_details'] = data['additional_details']
            
        if 'image_url' in data:
            listing_data['image_url'] = data['image_url']
        
        # Insert the listing into Supabase
        response = supabase.table('listings').insert(listing_data).execute()
        
        # Process response
        if hasattr(response, 'error') and response.error:
            return jsonify({"error": response.error.message}), 400
            
        return jsonify({
            "message": "Listing created successfully",
            "listing": response.data[0] if response.data else None
        }), 201
        
    except Exception as e:
        print(f"Error creating listing: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Get all listings
@app.route('/listings', methods=['GET'])
def get_listings():
    try:
        # Get query parameters for filtering
        city = request.args.get('city')
        country = request.args.get('country')
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        min_bedrooms = request.args.get('min_bedrooms', type=int)
        owner_id = request.args.get('owner_id')
        limit = request.args.get('limit', 20, type=int)
        offset = request.args.get('offset', 0, type=int)
        user_id = request.args.get('user_id')
        
        # Only allow access if user_id is supplied
        if not user_id:
            return jsonify({
                "listings": [],
                "count": 0,
                "offset": offset,
                "limit": limit
            }), 200
        
        # Step 1: Fetch list of listing_ids this user has access to
        access_resp = supabase.table('listing_access').select('listing').eq('user', user_id).execute()
        if hasattr(access_resp, 'error') and access_resp.error:
            return jsonify({"error": access_resp.error.message}), 400
        allowed_listing_ids = [row['listing'] for row in access_resp.data]

        if not allowed_listing_ids:
            return jsonify({
                "listings": [],
                "count": 0,
                "offset": offset,
                "limit": limit
            }), 200

        # Start building the query (with restriction)
        query = supabase.table('listings').select('*').in_('id', allowed_listing_ids)
        
        # Apply filters if they exist
        if city:
            query = query.ilike('city', f'%{city}%')
        
        if country:
            query = query.ilike('country', f'%{country}%')
            
        if min_price is not None:
            query = query.gte('cost_per_night', min_price)
            
        if max_price is not None:
            query = query.lte('cost_per_night', max_price)
            
        if min_bedrooms is not None:
            query = query.gte('number_of_bedrooms', min_bedrooms)
            
        if owner_id:
            query = query.eq('owner_id', owner_id)
        
        # Add pagination and ordering
        query = query.range(offset, offset + limit - 1).order('created_at', desc=True)
        
        # Execute the query
        response = query.execute()
        
        # Check for errors
        if hasattr(response, 'error') and response.error:
            return jsonify({"error": response.error.message}), 400
        
        return jsonify({
            "listings": response.data,
            "count": len(response.data),
            "offset": offset,
            "limit": limit
        }), 200
        
    except Exception as e:
        print(f"Error fetching listings: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Get a specific listing
@app.route('/listings/<listing_id>', methods=['GET'])
def get_listing(listing_id):
    try:
        # Query the listing
        response = supabase.table('listings').select('*').eq('id', listing_id).execute()
        
        # Check if listing exists
        if not response.data:
            return jsonify({"error": "Listing not found"}), 404
        
        return jsonify({"listing": response.data[0]}), 200
        
    except Exception as e:
        print(f"Error fetching listing: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Update a listing
@app.route('/listings/<listing_id>', methods=['PUT', 'PATCH'])
def update_listing(listing_id):
    try:
        # Get the JWT token from authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Authorization header required"}), 401
        
        token = auth_header.replace('Bearer ', '')
        
        # Verify the token and get user data
        try:
            user_response = supabase.auth.get_user(token)
            user = user_response.user
            
            if not user:
                return jsonify({"error": "Invalid authentication token"}), 401
                
        except Exception as e:
            return jsonify({"error": f"Authentication error: {str(e)}"}), 401
        
        # First check if the listing exists and belongs to the user
        listing_response = supabase.table('listings').select('*').eq('id', listing_id).execute()
        
        if not listing_response.data:
            return jsonify({"error": "Listing not found"}), 404
        
        listing = listing_response.data[0]
        
        # Check if the authenticated user is the owner
        if listing.get('owner_id') != user.id:
            return jsonify({"error": "You don't have permission to update this listing"}), 403
        
        # Get listing data from request
        data = request.get_json()
        
        # Create update object
        update_data = {}
        allowed_fields = [
            'name', 'description', 'address', 'city', 'country',
            'cost_per_night', 'number_of_bedrooms', 'number_of_bathrooms',
            'max_occupancy', 'additional_details', 'image_url'
        ]
        
        for field in allowed_fields:
            if field in data:
                # Convert numeric fields
                if field == 'cost_per_night':
                    update_data[field] = float(data[field])
                elif field in ['number_of_bedrooms', 'number_of_bathrooms', 'max_occupancy']:
                    update_data[field] = int(data[field])
                else:
                    update_data[field] = data[field]
        
        # Add updated_at timestamp
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        # Update the listing
        response = supabase.table('listings').update(update_data).eq('id', listing_id).execute()
        
        return jsonify({
            "message": "Listing updated successfully",
            "listing": response.data[0] if response.data else None
        }), 200
        
    except Exception as e:
        print(f"Error updating listing: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Delete a listing
@app.route('/listings/<listing_id>', methods=['DELETE'])
def delete_listing(listing_id):
    try:
        # Get the JWT token from authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Authorization header required"}), 401
        
        token = auth_header.replace('Bearer ', '')
        
        # Verify the token and get user data
        try:
            user_response = supabase.auth.get_user(token)
            user = user_response.user
            
            if not user:
                return jsonify({"error": "Invalid authentication token"}), 401
                
        except Exception as e:
            return jsonify({"error": f"Authentication error: {str(e)}"}), 401
        
        # First check if the listing exists and belongs to the user
        listing_response = supabase.table('listings').select('*').eq('id', listing_id).execute()
        
        if not listing_response.data:
            return jsonify({"error": "Listing not found"}), 404
        
        listing = listing_response.data[0]
        
        # Check if the authenticated user is the owner
        if listing.get('owner_id') != user.id:
            return jsonify({"error": "You don't have permission to delete this listing"}), 403
        
        # Delete the listing
        response = supabase.table('listings').delete().eq('id', listing_id).execute()
        
        return jsonify({
            "message": "Listing deleted successfully"
        }), 200
        
    except Exception as e:
        print(f"Error deleting listing: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Get listings for the authenticated user
@app.route('/my-listings', methods=['GET'])
def get_my_listings():
    try:
        # Get the JWT token from authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Authorization header required"}), 401
        
        token = auth_header.replace('Bearer ', '')
        
        # Verify the token and get user data
        try:
            user_response = supabase.auth.get_user(token)
            user = user_response.user
            
            if not user:
                return jsonify({"error": "Invalid authentication token"}), 401
                
        except Exception as e:
            return jsonify({"error": f"Authentication error: {str(e)}"}), 401
        
        # Query listings owned by this user
        response = supabase.table('listings') \
            .select('*') \
            .eq('owner', user.id) \
            .order('created_at', desc=True) \
            .execute()
        
        return jsonify({
            "listings": response.data,
            "count": len(response.data)
        }), 200
        
    except Exception as e:
        print(f"Error fetching user listings: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/reservations', methods=['POST'])
@auth_required
def create_reservation():
    try:
        # Get data from request body\
        data = request.get_json()
        print(request.user.id)
        # Validate required fields
        # required_fields = ['primary_guest', 'listing', 'start_date', 'end_date', 
        #                   'total_cost', 'number_of_guests']
        
        # for field in required_fields:
        #     if field not in data:
        #         return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Parse dates
        try:
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        # Validate date range
        if end_date <= start_date:
            return jsonify({"error": "End date must be after start date"}), 400
        
        # Check if listing exists
        listing_response = supabase.table('listings').select('id').eq('id', data['listing']).execute()
        if len(listing_response.data) == 0:
            return jsonify({"error": "Listing not found"}), 404
            
        # Check if user exists
        user_response = supabase.table('profiles').select('id').eq('id', request.user.id).execute()
        if len(user_response.data) == 0:
            return jsonify({"error": "User not found"}), 404
        
        # Check for booking conflicts - any overlap with existing reservations
        availability_check = supabase.table('reservations').select('*').eq('listing', data['listing']).execute()
        for booking in availability_check.data:
            booking_start = datetime.strptime(booking['start_date'], '%Y-%m-%d').date() 
            booking_end = datetime.strptime(booking['end_date'], '%Y-%m-%d').date()
            
            # Check for date overlap
            if (start_date <= booking_end and end_date >= booking_start):
                return jsonify({"error": "Selected dates are not available"}), 409
        
        # Create reservation with validated data
        reservation_data = {
            'primary_guest': request.user.id,
            'listing': data['listing'],
            'start_date': data['start_date'],
            'end_date': data['end_date'],
            'total_cost': float(data['total_cost']),
            'number_of_guests': int(data['number_of_guests'])
        }
        
        # Insert the reservation into Supabase
        result = supabase.table('reservations').insert(reservation_data).execute()
        
        if result.data:
            return jsonify({"message": "Reservation created successfully", "reservation": result.data[0]}), 201
        else:
            return jsonify({"error": "Failed to create reservation"}), 500
            
    except Exception as e:
        print(f"Error creating reservation: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/reservations', methods=['GET'])
def get_reservations():
    response = supabase.table('reservations').select('*').execute()
    return jsonify({
            "reservations": response.data,
        }), 200

@app.route('/reservations/property/<id>', methods=['GET'])
def get_property_reservations(id):
    response = supabase.table('reservations').select('reservation_id','start_date, end_date,  profiles:primary_guest(full_name)').eq('listing', id).execute()
    return jsonify({
        "reservations": response.data
    }), 200

@app.route('/reservations/me', methods=['GET'])
@auth_required
def get_my_reservations():
    try:
        # Since we're using the @auth_required decorator, the user info is already in request.user
        user_id = request.user.id
        # Query reservations made by this user
        response = supabase.table('reservations')\
            .select('*, listings(*)') \
            .eq('primary_guest', user_id)\
            .order('start_date', desc=False)\
            .execute()
        
        if hasattr(response, 'error') and response.error:
            return jsonify({"error": response.error.message}), 400
            
        return jsonify({
            "reservations": response.data,
            "count": len(response.data)
        }), 200
        
    except Exception as e:
        print(f"Error fetching user reservations: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/reservations/my-properties', methods=['GET'])
@auth_required
def get_my_property_reservations():
    try:
        user_id = request.user.id
        
        # First get all listings owned by the user
        listings_response = supabase.table('listings')\
            .select('id')\
            .eq('owner', user_id)\
            .execute()
            
        if not listings_response.data:
            return jsonify({
                "reservations": [],
                "count": 0
            }), 200
            
        # Get all listing IDs owned by the user
        listing_ids = [listing['id'] for listing in listings_response.data]
        
        # Query reservations for these listings
        response = supabase.table('reservations')\
            .select('*, listings(*), profiles!primary_guest(*)')\
            .in_('listing', listing_ids)\
            .order('start_date', desc=False)\
            .execute()
        
        if hasattr(response, 'error') and response.error:
            return jsonify({"error": response.error.message}), 400
            
        return jsonify({
            "reservations": response.data,
            "count": len(response.data)
        }), 200
        
    except Exception as e:
        print(f"Error fetching property reservations: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
# Get single reservation details
@app.route('/reservations/<reservation_id>', methods=['GET'])
@auth_required
def get_a_reservation(reservation_id):
    try:
        # Since we're using the @auth_required decorator, the user info is already in request.user
        user_id = request.user.id
        # Query reservations made by this user
        response = supabase.table('reservations')\
            .select('*, listings(*), profiles(*)') \
            .eq('reservation_id', reservation_id)\
            .execute()
        
        if hasattr(response, 'error') and response.error:
            return jsonify({"error": response.error.message}), 400
            
        return jsonify({
            "reservation": response.data,
            "count": len(response.data)
        }), 200
        
    except Exception as e:
        print(f"Error fetching user reservations: {str(e)}")
@app.route('/reservations/<reservation_id>', methods=['PATCH'])
@auth_required
def patch_reservation(reservation_id):
    try:
        user_id = request.user.id
        data = request.get_json()
        if "confirmed" not in data:
            return jsonify({"error": "Missing 'confirmed' in request body"}), 400

        # First, fetch the reservation to check listing ownership
        reservation_resp = supabase.table('reservations').select('listing').eq('reservation_id', reservation_id).single().execute()
        if hasattr(reservation_resp, 'error') and reservation_resp.error:
            return jsonify({"error": reservation_resp.error.message}), 400
        reservation = reservation_resp.data
        if reservation is None or 'listing' not in reservation:
            return jsonify({"error": "Reservation/listing not found"}), 404

        # Fetch listing to check owner
        listing_resp = supabase.table('listings').select('owner').eq('id', reservation['listing']).single().execute()
        if hasattr(listing_resp, 'error') and listing_resp.error:
            return jsonify({"error": listing_resp.error.message}), 400
        listing = listing_resp.data
        if not listing or 'owner' not in listing or listing['owner'] != user_id:
            return jsonify({"error": "Forbidden: only property owner can confirm"}), 403

        # Update reservation to confirmed
        update_resp = supabase.table('reservations').update({'confirmed': True}).eq('reservation_id', reservation_id).execute()
        if hasattr(update_resp, 'error') and update_resp.error:
            return jsonify({"error": update_resp.error.message}), 400

        return jsonify({"reservation": update_resp.data}), 200
    except Exception as e:
        print(f"Error confirming reservation: {str(e)}")
        return jsonify({"error": str(e)}), 500
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)


# CORS(app)
# # Database configuration
# app.config['SQLALCHEMY_DATABASE_URI'] = 'https://wmedrunwuxlzmdfnisfp.supabase.co'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# db = SQLAlchemy()
# db.init_app(app)
# ma = Marshmallow(app)


# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True, unique=True)
#     name = db.Column(db.String(100), nullable=False)
#     email = db.Column(db.String(120), unique=True, nullable=False)
#     phone = db.Column(db.String(12), unique=True, nullable=True)
#     listings = db.relationship('Listings', backref='user', lazy=True)
#     def __repr__(self):
#         return f'<User {self.name}>'

# class Listings(db.Model):
#     id = db.Column("id", db.Integer, primary_key=True)
#     name = db.Column(db.String(100), nullable=False)
#     description = db.Column(db.Text)
#     owner = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
#     address = db.Column(db.String(200), nullable=False)
#     city = db.Column(db.String(100), nullable=False)
#     country = db.Column(db.String(100), nullable=False)
#     cost_per_night = db.Column(db.Float, nullable=False)
#     number_of_bedrooms = db.Column(db.Integer, nullable=False)
#     number_of_bathrooms = db.Column(db.Integer, nullable=False)
#     max_occupancy = db.Column(db.Integer, nullable=False)
#     additional_details = db.Column(db.Text)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
#     updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

#     def __init__(self, name, description, owner, address, city, country, 
#                  cost_per_night, number_of_bedrooms, number_of_bathrooms, 
#                  max_occupancy, additional_details=None):
#         self.name = name
#         self.description = description
#         self.owner = owner
#         self.address = address
#         self.city = city
#         self.country = country
#         self.cost_per_night = cost_per_night
#         self.number_of_bedrooms = number_of_bedrooms
#         self.number_of_bathrooms = number_of_bathrooms
#         self.max_occupancy = max_occupancy
#         self.additional_details = additional_details

# # Listing schema
# class ListingSchema(ma.Schema):
#     class Meta:
#         fields = ('id', 'name', 'description', 'owner', 'address', 'city', 
#                  'country', 'cost_per_night', 'number_of_bedrooms', 
#                  'number_of_bathrooms', 'max_occupancy', 'additional_details', 
#                  'created_at', 'updated_at')

# listing_schema = ListingSchema()
# listings_schema = ListingSchema(many=True)

# # Routes for user management
# @app.route('/api/users', methods=['POST'])
# def create_user():
#     data = request.json
#     try:
#         new_user = User(
#             name=data['name'],
#             email=data['email'],
#             phone=data.get('phone')  # Phone is optional
#         )
#         db.session.add(new_user)
#         db.session.commit()
#         return jsonify({'message': 'User created successfully', 'id': new_user.id}), 201
#     except Exception as e:
#         return jsonify({'error': str(e)}), 400

# @app.route('/api/users', methods=['GET'])
# def get_users():
#     users = User.query.all()
#     return jsonify([{
#         'id': user.id,
#         'name': user.name,
#         'email': user.email,
#         'phone': user.phone
#     } for user in users])

# # Routes for listing
# # Create a listing
# @app.route('/api/listing', methods=['POST'])
# def add_listing():
#     data = request.json
#     print("Received data:", data)  # For debugging
#     try:
#         new_listing = Listings(
#             name=data['name'],
#             description=data['description'],
#             owner=data['owner'],
#             address=data['address'],
#             city=data['city'],
#             country=data['country'],
#             cost_per_night=float(data['cost_per_night']),
#             number_of_bedrooms=int(data['number_of_bedrooms']),
#             number_of_bathrooms=int(data['number_of_bathrooms']),
#             max_occupancy=int(data['max_occupancy']),
#             additional_details=data.get('additional_details')
#         )
#         db.session.add(new_listing)
#         db.session.commit()
#         return listing_schema.jsonify(new_listing)
#     except Exception as e:
#         return jsonify({'error': str(e)}), 400

# # Get All Listings
# @app.route('/api/listing', methods=['GET'])
# def get_listings():
#     all_listings = Listings.query.all()
#     result = listings_schema.dump(all_listings)
#     return jsonify(result)

# # Get a single Listing
# @app.route('/api/listing/<id>', methods=['GET'])
# def get_listing(id):
#     listing = Listings.query.get(id)
#     return listing_schema.jsonify(listing)

# # Update a listing
# @app.route('/api/listing/<id>', methods=['PUT'])
# def update_listing(id):
#     listing = Listings.query.get(id)
#     data = request.json
#     try:
#         listing.name = data['name']
#         listing.description = data['description']
#         listing.owner = data['owner']
#         listing.address = data['address']
#         listing.city = data['city']
#         listing.country = data['country']
#         listing.cost_per_night = float(data['cost_per_night'])
#         listing.number_of_bedrooms = int(data['number_of_bedrooms'])
#         listing.number_of_bathrooms = int(data['number_of_bathrooms'])
#         listing.max_occupancy = int(data['max_occupancy'])
#         listing.additional_details = data.get('additional_details')
#         db.session.commit()
#         return listing_schema.jsonify(listing)
#     except Exception as e:
#         return jsonify({'error': str(e)}), 400

# # Delete a listing
# @app.route('/api/listing/<id>', methods=['DELETE'])
# def delete_listing(id):
#     listing = Listings.query.get(id)
#     db.session.delete(listing)
#     db.session.commit()
#     return listing_schema.jsonify(listing)

# if __name__ == "__main__":
#     with app.app_context():
#         db.create_all()
#     app.run(debug=True)

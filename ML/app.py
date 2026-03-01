from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import math
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity

# -------------------------------
# Setup
# -------------------------------
load_dotenv()

app = Flask(__name__)
CORS(app)

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["smart_parking"]
parking_collection = db["parkingspots"]


# -------------------------------
# Distance Calculation
# -------------------------------
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)

    a = math.sin(dLat/2)**2 + \
        math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * \
        math.sin(dLon/2)**2

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

# -------------------------------
# Encoding
# -------------------------------
def encode_size(size):
    return {"small": 0, "medium": 1, "large": 2}.get(size, 1)

def encode_type(type_):
    return {"open": 0, "covered": 1, "garage": 2}.get(type_, 0)

# -------------------------------
# Recommendation Route
# -------------------------------
@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        data = request.json

        # Required fields
        user_lat = float(data["userLat"])
        user_lng = float(data["userLng"])
        user_budget = float(data["budget"])

        preferred_size = data.get("preferredSize", "medium")
        preferred_type = data.get("preferredType", "open")

        # Fetch available spots
        spots = list(parking_collection.find({
            "isApproved": True,
            "status": "free"
        }))

        if not spots:
            return jsonify([])

        feature_matrix = []
        spot_info = []

        for spot in spots:

            if "coordinates" not in spot:
                continue

            lat = spot["coordinates"]["lat"]
            lng = spot["coordinates"]["lng"]

            distance = calculate_distance(user_lat, user_lng, lat, lng)
            price = spot.get("pricePerHour", 0)
            rating = spot.get("averageRating", 0)

            # Skip extremely expensive spots
            if price > user_budget * 2:
                continue

            size_encoded = encode_size(spot.get("size", "medium"))
            type_encoded = encode_type(spot.get("type", "open"))

            feature_matrix.append([
                price,
                rating,
                size_encoded,
                type_encoded,
                distance
            ])

            spot_info.append({
                "_id": str(spot["_id"]),   # MongoDB default ObjectId
                "address": spot.get("address", ""),
                "pricePerHour": price,
                "averageRating": rating,
                "distance_km": round(distance, 2)
            })

        if not feature_matrix:
            return jsonify([])

        feature_matrix = np.array(feature_matrix)

        # Normalize
        scaler = MinMaxScaler()
        normalized_features = scaler.fit_transform(feature_matrix)

        # User preference vector
        user_vector = np.array([[
            user_budget,
            5,  # prefers high rating
            encode_size(preferred_size),
            encode_type(preferred_type),
            0   # wants minimum distance
        ]])

        user_vector = scaler.transform(user_vector)

        # Cosine similarity
        similarities = cosine_similarity(user_vector, normalized_features)[0]

        # Attach score
        for i in range(len(spot_info)):
            # Distance penalty improves realism
            distance_penalty = spot_info[i]["distance_km"] * 0.02
            final_score = similarities[i] - distance_penalty
            spot_info[i]["score"] = round(float(final_score), 4)

        # Sort highest score first
        spot_info.sort(key=lambda x: x["score"], reverse=True)

        # Add ranking
        for index, spot in enumerate(spot_info):
            spot["rank"] = index + 1

            # Optional label for frontend
            if index == 0:
                spot["label"] = "Best Match"
            elif index == 1:
                spot["label"] = "Great Option"
            elif index == 2:
                spot["label"] = "Good Option"
            else:
                spot["label"] = "Recommended"

        return jsonify(spot_info[:5])

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/test-db", methods=["GET"])
def test_db():
    try:
        print("🔍 Checking total parking spots...\n")

        total_spots = parking_collection.count_documents({})

        print(f"✅ Total parking spots: {total_spots}\n")
        print("📦 Sample Parking Spots:\n")

        # Print first 5 spots in terminal only
        spots = parking_collection.find().limit(5)

        for spot in spots:
            print("------------")
            print(f"ID: {spot['_id']}")
            print(f"Address: {spot.get('address')}")
            print(f"Price: {spot.get('pricePerHour')}")
            print(f"Size: {spot.get('size')}")
            print(f"Type: {spot.get('type')}")
            print("------------\n")

        return jsonify({
            "totalParkingSpots": total_spots
        })

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True, port=5001)


# {
#   "userLat": 22.5735,
#   "userLng": 88.4331,
#   "budget": 70,
#   "preferredSize": "medium",
#   "preferredType": "covered"
# }
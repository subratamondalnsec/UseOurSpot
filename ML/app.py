from flask import Flask
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

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

    a = math.sin(dLat/2)**2 + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dLon/2)**2

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c


# -------------------------------
# Encoding categorical features
# -------------------------------
def encode_size(size):
    return {"small": 0, "medium": 1, "large": 2}.get(size, 0)

def encode_type(type_):
    return {"open": 0, "covered": 1}.get(type_, 0)


# -------------------------------
# Recommendation Route
# -------------------------------
@app.route("/recommend", methods=["POST"])
def recommend():

    data = request.json

    user_lat = data["userLat"]
    user_lng = data["userLng"]
    user_budget = data["budget"]
    preferred_size = data.get("preferredSize", "medium")
    preferred_type = data.get("preferredType", "open")

    # Fetch approved + free spots
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
        price = spot["pricePerHour"]
        rating = spot.get("averageRating", 0)
        size_encoded = encode_size(spot.get("size", "small"))
        type_encoded = encode_type(spot.get("type", "open"))

        feature_matrix.append([
            price,
            rating,
            size_encoded,
            type_encoded,
            distance
        ])

        spot_info.append({
            "spotId": str(spot["_id"]),
            "address": spot["address"],
            "pricePerHour": price,
            "averageRating": rating,
            "distance_km": round(distance, 2)
        })

    # Convert to numpy
    feature_matrix = np.array(feature_matrix)

    # Normalize features
    scaler = MinMaxScaler()
    normalized_features = scaler.fit_transform(feature_matrix)

    # Create user preference vector
    user_vector = np.array([[
        user_budget,
        5,  # assume user prefers high rating
        encode_size(preferred_size),
        encode_type(preferred_type),
        0   # user wants minimum distance
    ]])

    user_vector = scaler.transform(user_vector)

    # Calculate cosine similarity
    similarities = cosine_similarity(user_vector, normalized_features)[0]

    # Attach similarity score
    for i in range(len(spot_info)):
        spot_info[i]["similarity"] = float(similarities[i])

    # Sort by similarity (highest first)
    spot_info.sort(key=lambda x: x["similarity"], reverse=True)

    return jsonify(spot_info[:5])


if __name__ == "__main__":
    app.run(debug=True, port=5001)
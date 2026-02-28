# 📮 Postman Collection - Quick Start Guide

## 📥 Import the Collection

### **Step 1: Open Postman**
- Launch Postman desktop app or go to https://web.postman.com

### **Step 2: Import**
1. Click **"Import"** button (top left)
2. Click **"Upload Files"**
3. Select: `Smart_Parking_API.postman_collection.json`
4. Click **"Import"**

✅ You'll see **"Smart Parking API - Complete Collection"** in your Collections

---

## 🚀 How to Use This Collection

### **📁 Collection Structure**

```
Smart Parking API - Complete Collection
├── 🔐 Authentication (7 endpoints)
│   ├── Register User (Driver)
│   ├── Register User (Owner)
│   ├── Register User (Admin)
│   ├── Login
│   ├── Forgot Password
│   ├── Reset Password
│   └── Logout
│
├── 🏠 Owner APIs (6 endpoints)
│   ├── Add Parking Spot
│   ├── Get My Spots
│   ├── Edit Parking Spot
│   ├── Delete Parking Spot
│   ├── Get Earnings
│   └── Get Spot Status
│
├── 🚗 Driver APIs (2 endpoints)
│   ├── Search Parking Spots
│   └── Search Spots (All Available)
│
├── 📅 Booking APIs (7 endpoints)
│   ├── Create Booking
│   ├── Scan QR Code
│   ├── End Parking Session
│   ├── Get My Bookings
│   ├── Extend Booking Time
│   ├── Rate Parking Spot
│   └── Find My Car
│
├── 👨‍💼 Admin APIs (6 endpoints)
│   ├── Get Pending Spots
│   ├── Approve Parking Spot
│   ├── Remove Parking Spot
│   ├── Get All Users
│   ├── Get Heatmap Data
│   └── Get Dashboard Stats
│
└── 🏥 Health Check (1 endpoint)
    └── API Health Check
```

---

## 🎯 Testing Workflow (Recommended Order)

### **1️⃣ Start Your Server**
```bash
cd smart-parking-backend
npm run dev
```

### **2️⃣ Health Check**
- Run: **Health Check → API Health Check**
- Should return: `"🚗 Smart Parking API is running"`

### **3️⃣ Register Users**

**Register an Owner:**
1. Run: **Authentication → Register User (Owner)**
2. ✅ Auto-saves token to collection variable
3. Email: `owner@test.com` / Password: `password123`

**Register a Driver:**
1. Run: **Authentication → Register User (Driver)**
2. ✅ Auto-saves token to collection variable
3. Email: `driver@test.com` / Password: `password123`

**Register an Admin:**
1. Run: **Authentication → Register User (Admin)**
2. ✅ Auto-saves token to collection variable
3. Email: `admin@smartparking.com` / Password: `admin123456`

### **4️⃣ Owner Workflow**

**Login as Owner:**
```json
{
  "email": "owner@test.com",
  "password": "password123"
}
```

**Add a Parking Spot:**
1. Run: **Owner APIs → Add Parking Spot**
2. ✅ Auto-saves `spotId` to collection variable
3. All dummy data already filled in!

**View Your Spots:**
- Run: **Owner APIs → Get My Spots**

**Check Earnings:**
- Run: **Owner APIs → Get Earnings**

### **5️⃣ Admin Workflow**

**Login as Admin:**
```json
{
  "email": "admin@smartparking.com",
  "password": "admin123456"
}
```

**View Pending Spots:**
- Run: **Admin APIs → Get Pending Spots**

**Approve Spot:**
1. Copy a `spotId` from pending spots
2. Run: **Admin APIs → Approve Parking Spot**
3. (Uses `{{spotId}}` variable if set)

**View Dashboard:**
- Run: **Admin APIs → Get Dashboard Stats**

### **6️⃣ Driver Workflow**

**Login as Driver:**
```json
{
  "email": "driver@test.com",
  "password": "password123"
}
```

**Search for Spots:**
- Run: **Driver APIs → Search Parking Spots**
- With filters: lat, lng, maxPrice, type, size

**Create Booking:**
1. Copy a `spotId` from search results
2. Update `{{spotId}}` in the request
3. Run: **Booking APIs → Create Booking**
4. ✅ Auto-saves `bookingId`
5. ✅ Receives QR code + confirmation email

**View My Bookings:**
- Run: **Booking APIs → Get My Bookings**

**End Session:**
- Run: **Booking APIs → End Parking Session**
- Calculates overstay charges automatically

**Find My Car:**
- Run: **Booking APIs → Find My Car**
- Returns GPS coordinates

**Rate the Spot:**
- Run: **Booking APIs → Rate Parking Spot**

---

## 🔑 Collection Variables (Auto-Managed)

The collection automatically manages these variables:

| Variable | Description | Set By |
|----------|-------------|--------|
| `{{baseUrl}}` | API base URL | Pre-configured |
| `{{token}}` | JWT auth token | Auto-set on login/register |
| `{{spotId}}` | Current parking spot ID | Auto-set when spot created |
| `{{bookingId}}` | Current booking ID | Auto-set when booking created |

### **View/Edit Variables:**
1. Click on collection name
2. Go to **"Variables"** tab
3. See current values

---

## 📝 Request Body Examples

All requests have **realistic dummy data** pre-filled. Here are the key ones:

### **Register User**
```json
{
  "name": "John Driver",
  "email": "driver@test.com",
  "password": "password123",
  "role": "driver",
  "phone": "+1234567890"
}
```

### **Add Parking Spot**
```
Form-data (multipart/form-data):
- address: "123 Main Street, Downtown, New York, NY 10001"
- coordinates[lat]: 40.7128
- coordinates[lng]: -74.0060
- size: "medium"
- type: "covered"
- rules: "No overnight parking. Maximum 6 hours."
- pricePerHour: 15
- photos: [Upload image file]
```

### **Create Booking**
```json
{
  "spotId": "{{spotId}}",
  "startTime": "2026-03-01T09:00:00.000Z",
  "endTime": "2026-03-01T14:00:00.000Z",
  "carLocation": {
    "lat": 40.7128,
    "lng": -74.0060
  }
}
```

### **Rate Spot**
```json
{
  "bookingId": "{{bookingId}}",
  "rating": 5,
  "comment": "Excellent parking spot! Very clean and secure."
}
```

---

## 🔐 Authentication

### **How Token Auth Works:**

1. **Login or Register** → Receives JWT token
2. **Token auto-saved** to `{{token}}` variable
3. **All protected routes** automatically use:
   ```
   Authorization: Bearer {{token}}
   ```

### **Manually Set Token:**
If needed, you can manually update the token:
1. Copy token from login response
2. Go to collection **Variables** tab
3. Paste into `token` value
4. Save

---

## 🎨 Query Parameters Examples

### **Search Parking Spots (with all filters)**
```
GET /api/driver/search?lat=40.7128&lng=-74.0060&maxPrice=25&type=covered&size=medium
```

**Parameters:**
- `lat` = User's current latitude
- `lng` = User's current longitude
- `maxPrice` = Maximum price per hour (optional)
- `type` = `open` or `covered` (optional)
- `size` = `small`, `medium`, or `large` (optional)

---

## 🚨 Common Issues & Solutions

### **❌ "Not authorized, no token"**
**Solution:** 
1. Run login/register first
2. Check if `{{token}}` variable is set
3. Ensure Bearer token in Authorization header

### **❌ "Spot not found"**
**Solution:**
1. Replace `{{spotId}}` with actual spot ID
2. Or run "Add Parking Spot" first to auto-set variable

### **❌ "CORS error"**
**Solution:**
- Check if `CLIENT_URL` in `.env` includes your origin
- Default allows: `http://localhost:3000`

### **❌ "Validation error"**
**Solution:**
- Check request body format
- Ensure all required fields are filled
- Check date formats (ISO 8601)

---

## 🎯 Test Scenarios

### **Scenario 1: Complete Booking Flow**
1. Register driver
2. Login as driver
3. Search spots (copy spotId)
4. Create booking
5. Scan QR
6. End session
7. Rate spot

### **Scenario 2: Owner Setup**
1. Register owner
2. Login as owner
3. Add parking spot
4. View my spots
5. Check earnings
6. View spot status

### **Scenario 3: Admin Approval**
1. Register admin
2. Login as admin
3. View pending spots
4. Approve spot
5. Check dashboard stats

---

## 📊 Response Examples

### **Successful Login**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f8a9b1c2d3e4f5a6b7c8d9",
    "name": "John Driver",
    "email": "driver@test.com",
    "role": "driver"
  }
}
```

### **Booking Created**
```json
{
  "success": true,
  "booking": {
    "_id": "65f8a9b1c2d3e4f5a6b7c8d9",
    "driverId": "...",
    "spotId": "...",
    "qrCode": "data:image/png;base64,...",
    "baseAmount": 75,
    "finalAmount": 75,
    "status": "active"
  }
}
```

### **Search Results**
```json
{
  "success": true,
  "count": 3,
  "spots": [
    {
      "_id": "...",
      "address": "123 Main Street, Downtown",
      "pricePerHour": 15,
      "type": "covered",
      "status": "free",
      "distance": 0.45
    }
  ]
}
```

---

## 💡 Pro Tips

### **1. Use Environment for Multiple Servers**
Create environments for:
- Local: `http://localhost:5000/api`
- Staging: `https://staging-api.smartparking.com/api`
- Production: `https://api.smartparking.com/api`

### **2. Save Example Responses**
Right-click on request → **"Save Response"** → Use as example

### **3. Test Scripts**
Collection already has auto-save scripts for:
- Token after login
- SpotId after creating spot
- BookingId after creating booking

### **4. Folder-Level Auth**
Token is applied at collection level, so all requests use it automatically!

---

## 📚 API Documentation

For detailed API documentation, see:
- [README.md](README.md) - Complete API reference
- [BACKEND_ANALYSIS.md](BACKEND_ANALYSIS.md) - Feature analysis

---

## 🎉 Quick Test (2 Minutes)

```bash
# 1. Start server
npm run dev

# 2. In Postman:
✅ Health Check
✅ Register User (Driver)
✅ Login (token auto-saved)
✅ Register User (Owner) 
✅ Add Parking Spot (spotId auto-saved)
✅ Login as Admin
✅ Approve Spot
✅ Login as Driver
✅ Search Spots
✅ Create Booking (uses saved spotId)
✅ Get My Bookings

# ✅ Done! All APIs tested!
```

---

**Collection Version:** 1.0  
**Last Updated:** February 28, 2026  
**Total Endpoints:** 28  
**Base URL:** http://localhost:5000/api

**Happy Testing! 🚀**

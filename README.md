# 🚀 Hack the North 2025 Backend Challenge

## 📢 Introduction
Welcome to the Hack the North 2025 Badge Scanning API! This backend system enables hackathon attendee interactions through badge scanning, activity tracking, and social connections.

## 🌐 Live Demo
- **API URL**: https://hackthenorth-backend-production.up.railway.app
- **API Documentation**: https://hackthenorth-backend-production.up.railway.app/api-docs

## 📁 Project Structure

```
📦 hackthenorth-backend
├── 📁 src
│   ├── 📁 controllers   # Business logic
│   │   ├── activityController.ts
│   │   ├── friendController.ts
│   │   ├── scanController.ts
│   │   └── userController.ts
│   ├── 📁 routes   # API routes
│   │   ├── activityRoutes.ts
│   │   ├── friendRoutes.ts
│   │   ├── scanRoutes.ts
│   │   └── userRoutes.ts
│   ├── 📁 utils    # Utilities
│   │   └── prisma.ts
│   ├── server.ts   # Express setup
│   └── swagger.ts  # API docs
├── 📁 prisma  # Database
├── package.json
└── README.md
```


## 📚 Database Schema

```prisma
model User {
  id             Int          @id @default(autoincrement())
  name           String
  email          String       @unique
  phone          String
  badge_code     String?      @unique  // Optional until check-in
  updated_at     DateTime     @updatedAt
  checked_in     Boolean      @default(false)
  receivedScans  FriendScan[] @relation("ScannedRelation")
  scannedFriends FriendScan[] @relation("ScannerRelation")
  scans          Scan[]
}

model Activity {
  id            Int     @id @default(autoincrement())
  name          String  @unique
  category      String
  one_scan_only Boolean @default(false)
  scans         Scan[]
}

model Scan {
  id         Int      @id @default(autoincrement())
  userId     Int
  activityId Int
  scanned_at DateTime @default(now())
  activity   Activity @relation(fields: [activityId], references: [id])
  user       User     @relation(fields: [userId], references: [id])
}

model FriendScan {
  id         Int      @id @default(autoincrement())
  scannerId  Int
  scannedId  Int
  scanned_at DateTime @default(now())
  scanned    User     @relation("ScannedRelation", fields: [scannedId], references: [id])
  scanner    User     @relation("ScannerRelation", fields: [scannerId], references: [id])

  @@unique([scannerId, scannedId])  // Prevents duplicate scans
}
```

### Key Design Decisions

#### User Model
- `badge_code` is nullable (`String?`) because users don't have badges until check-in
- Two friend scan relations (`receivedScans` and `scannedFriends`) to track both directions of friendship
- `updated_at` automatically updates on any change, useful for tracking check-in/out times

#### Activity Model
- `name` is unique to prevent duplicate activities
- `one_scan_only` flag enables special rules for certain activities
- `category` helps organize activities (e.g., "Workshop", "Food", "Social")

#### Scan Model
- Links users to activities with timestamps
- Many-to-many relationship allowing users to scan multiple activities
- `scanned_at` defaults to current time for accurate tracking

#### FriendScan Model
- Represents bidirectional friendships
- Uses two separate relations to the User model:
  - `scanner`: The person who initiated the scan
  - `scanned`: The person whose badge was scanned
- `@@unique([scannerId, scannedId])` prevents duplicate friend connections
- Includes timestamp to track when friendships were formed

### Relationship Flow
```
User ─┬─── Scans ───── Activity
      └─── FriendScan ─ User
```
- Users can scan many activities
- Users can scan many friends
- Activities track all user scans
- Friend connections are one-time and bidirectional

## 🛠️ Setup & Installation

### Option 1: Use the Hosted API
The easiest way to try out the API is to use the hosted version:
- **API URL**: https://hackthenorth-backend-production.up.railway.app
- **API Documentation**: https://hackthenorth-backend-production.up.railway.app/api-docs

### Option 2: Local Setup

#### 🔧 Prerequisites
- Node.js (v18+)
- PostgreSQL (if using local setup)
- Neon DB account (if using cloud setup)
- Prisma CLI

#### 📦 Installation Steps

1. **Clone & Install Dependencies**
   ```bash
   git clone https://github.com/VJagiasi/hackthenorth-backend
   cd hackthenorth-backend
   npm install
   ```

2. **Database Setup (Choose One)**

   **Option A: Local PostgreSQL**
   ```bash
   # Start PostgreSQL
   brew services start postgresql    # macOS
   sudo service postgresql start     # Linux
   # Windows: Start via pgAdmin or Services
   
   # Create database
   createdb hackthenorth
   # If above fails, try:
   psql -U postgres -c "CREATE DATABASE hackthenorth;"
   
   # Set up environment
   cp .env.example .env
   # Update .env with:
   DATABASE_URL="postgresql://your_username:your_password@localhost:5432/hackthenorth"
   PORT=3000
   ```

   **Option B: Neon DB (Cloud PostgreSQL)**
   1. Create account at [Neon DB](https://neon.tech)
   2. Create new project
   3. Copy connection string
   4. Set up environment:
      ```bash
      cp .env.example .env
      # Update .env with:
      DATABASE_URL="your-neon-connection-string"
      PORT=3000
      ```

3. **Setup Database & Sample Data**
   ```bash
   # Run migrations
   npx prisma migrate dev --name init
   
   # Seed database
   npx prisma db seed
   ```

4. **Start Server**
   ```bash
   npx ts-node src/server.ts
   ```
   Access:
   - API: http://localhost:3000
   - Docs: http://localhost:3000/api-docs

## 🔗 API Endpoints

### 👤 Users API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/:email` | Get user details |
| PUT | `/users/:email` | Update user |
| POST | `/users/:email/check-in` | Check-in user |
| POST | `/users/:email/check-out` | Check-out user |

### 📍 Scans API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/scan/:badge_code` | Record a scan |
| GET | `/scan` | Get scan stats |
| GET | `/scan/timeline` | Get time-based stats |

### 🤝 Friends API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/friends/scan/:badge_code` | Scan friend's badge |
| GET | `/friends/:badge_code` | Get scanned friends |

### 🎟️ Activities API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/activities` | Create activity |
| GET | `/activities` | List activities |
| GET | `/activities/:id` | Get activity details |
| PUT | `/activities/:name/one-scan` | Set one-scan rule |

# **Thought Process & Design Decisions**

Building this API was all about making the system **efficient**, **developer-friendly**, and **realistic** for a large hackathon setting. I had to make decisions around **data structure, API design, and constraints** to ensure smooth functionality. Here's how I approached it:

---

## **1. User Identification – Why I Chose Email Instead of Badge Code**

For endpoints like:

- `GET /users/:email`
- `PUT /users/:email`
- `POST /users/:email/check-in`
- `POST /users/:email/check-out`

I needed a way to uniquely identify users. The JSON dataset provided had a **badge_code** and an **email**, and I had to pick one.

💡 **Decision:** I went with **email** because:

- Emails are **naturally unique** and easy to validate.
- They are **human-readable** (compared to an auto-generated numeric ID).
- Most systems already use **email as a unique identifier** for authentication, so it made sense.

Why not badge_code?

- Badge codes are **randomly generated** at check-in. If a user hasn't checked in yet, they **don't have a badge_code**, which would make it unusable as a primary identifier.

---

## **2. Badge Scanning – Preventing Abuse & Cooldowns**

For the `POST /scan/:badge_code` endpoint, I had to **prevent duplicate scans** and **implement a cooldown**.

💡 **Key Decisions:**

1. **Check if the user is checked in** → If a user is **not checked in**, they shouldn't be able to scan into an activity. This prevents users from scanning badges they found lying around.
2. **Enforce a cooldown of 5 seconds** → This stops users from **spamming** scans and messing up attendance counts.
3. **Ensure the activity exists** → I check if the **activity_name** belongs to the **activity_category** to prevent mistakes like scanning into "Lunch" under the "Workshop" category.

This ensures **fairness** while making the scanning system **realistic for a hackathon setting**.

---

## **3. Restricting Certain Activities to "One Scan Only"**

For `PUT /activities/:activity_name/one-scan`, I implemented a **one-scan-only** rule. Some activities (like **midnight snacks**) should only allow a single scan per user.

💡 **How I Built This:**

- A **boolean field (`one_scan_only`)** was added to the **activity** table.
- Before inserting a new scan, I **check if the user already scanned into this activity**.
- If yes, I return an **error message** like:
    
    ```
    "You are only allowed one scan for 'Midnight Snack'."
    ```
    

This rule helps **enforce event policies** while keeping it **developer-friendly**.

---

## **4. Checking In & Out Users – Preventing Inconsistencies**

For:

- `POST /users/:email/check-in`
- `POST /users/:email/check-out`

I had to prevent **edge cases** where users might **check in twice or check out without checking in**.

💡 **Decisions Made:**

1. **Prevent duplicate check-ins** → If a user is already checked in, I return an error:
    
    ```
    "User is already checked in."
    ```
    
2. **Prevent checking out if not checked in** → If a user is already checked out, I return:
    
    ```
    "User is already checked out."
    ```
    
3. **Update `updated_at` field** whenever a check-in or check-out happens.

This ensures **data consistency** while preventing accidental API calls from causing logical errors.

---

## **5. Friend Scanning – Making Friendships Feel Realistic**

For:

- `POST /friends/scan/:badge_code`
- `GET /friends/:badge_code`

I wanted to make **friend scanning feel like real-world interactions**.

💡 **Key Constraints:**

1. **You can't scan yourself** → Prevents users from gaming the system by scanning their own badge.
2. **Both users must be checked in** → If someone is checked out, they can't scan a friend (makes sense, right?).
3. **You can't scan the same friend twice** → Once you've scanned a friend, that's it – no duplicate friendships.

These rules **keep friend scanning fair and fun**, mirroring real-world scenarios.

---

## **6. Retrieving Scan Data – Keeping It Fast & Useful**

For:

- `GET /scan`
- `GET /scan/timeline`

These endpoints had to handle **large amounts of data efficiently**, so I added **filters**.

💡 **Key Features:**

1. **Min/Max frequency filtering** → Lets organizers analyze activity engagement.
2. **Activity category filtering** → Helps narrow down scan data.
3. **Time-based grouping (`GET /scan/timeline`)** → Allows organizers to see trends (e.g., peak lunch hours).

These optimizations ensure **fast queries** and **useful insights**.

---

## **7. Activity Management – Why Activity Name Instead of ID**

For:

- `PUT /activities/:activity_name/one-scan`

I decided to **use activity_name instead of an ID**.

💡 **Why?**

- Activity names are **unique**.
- They are **easier to work with** than numeric IDs.
- IDs might change, but event names (like "Opening Ceremony") are stable.

Using **activity_name** keeps **API calls readable** and **eliminates unnecessary lookups**.

---

## **8. Designing the API to Be Developer-Friendly**

Throughout the API, I focused on making it **easy for developers**:

- **Meaningful error messages** (`"User not found"` instead of `404`).
- **Clear documentation** using **Swagger**.
- **Consistent response formats** → Every API returns structured JSON.
- **Using Prisma ORM** for **type safety and easier migrations**.

These choices make the **API easy to integrate, debug, and extend**.

---

## **Final Thoughts**

I wanted it to feel **natural to use**, **resilient to edge cases**, and **scalable**.

### **Some of the Best Things About This API:**

**Realistic Rules** → Users must be checked in before scanning.

**Preventing Exploits** → Scan cooldowns & one-scan-only enforcement.

**Data Integrity** → Unique constraints on emails, badge codes, and friendships.

**Fast Query Performance** → Using Prisma's filtering & grouping features.

**Good Developer Experience** → Thoughtful API design + Swagger documentation.

---

### **What I Would Improve If I Had More Time**

- **Implement authentication** (right now, anyone can make API calls).
- **Add rate limiting** to prevent abuse.
- **Write full test coverage** (currently missing).
- **Build a front-end dashboard** for organizers.


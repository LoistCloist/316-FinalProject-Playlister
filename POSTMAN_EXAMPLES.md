# Postman API Request Examples

## Base URL
```
http://localhost:4000
```

## Authentication
All playlist endpoints require authentication via JWT tokens stored in HTTP-only cookies. You must first login or register to receive a cookie, which Postman will automatically include in subsequent requests.

---

## 1. Authentication Endpoints

### Register User
**POST** `http://localhost:4000/auth/registerUser`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "userName": "JohnDoe",
  "email": "john@example.com",
  "password": "password123",
  "passwordVerify": "password123",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "userName": "JohnDoe",
    "email": "john@example.com"
  }
}
```
*Note: This sets a cookie that Postman will automatically use for subsequent requests.*

---

### Login User
**POST** `http://localhost:4000/auth/loginUser`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "userId": "uuid-here",
    "userName": "JohnDoe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "playlists": []
  }
}
```

---

### Get Logged In User
**GET** `http://localhost:4000/auth/getLoggedIn`

**Headers:**
```
(No headers needed - cookie is sent automatically)
```

**Expected Response:**
```json
{
  "loggedIn": true,
  "user": {
    "userId": "uuid-here",
    "userName": "JohnDoe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "playlists": []
  }
}
```

---

### Logout User
**GET** `http://localhost:4000/auth/logoutUser`

**Headers:**
```
(No headers needed)
```

---

## 2. Playlist Endpoints

### Create Playlist
**POST** `http://localhost:4000/store/playlist`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "playlistName": "My Favorite Songs",
  "userName": "JohnDoe",
  "email": "john@example.com",
  "songs": ["song-id-1", "song-id-2", "song-id-3"]
}
```

**Expected Response:**
```json
{
  "success": true
}
```

---

### Get Playlist By Id
**GET** `http://localhost:4000/store/playlist/:id`

**Example:**
```
GET http://localhost:4000/store/playlist/abc123-playlist-id
```

**Headers:**
```
(No headers needed - cookie is sent automatically)
```

**Expected Response:**
```json
{
  "success": true,
  "playlist": {
    "playlistId": "abc123-playlist-id",
    "userId": "user-uuid",
    "playlistName": "My Favorite Songs",
    "userName": "JohnDoe",
    "email": "john@example.com",
    "songs": ["song-id-1", "song-id-2"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get User Playlists
**GET** `http://localhost:4000/store/userplaylist/:userid`

**Example:**
```
GET http://localhost:4000/store/userplaylist/user-uuid-here
```

**Headers:**
```
(No headers needed - cookie is sent automatically)
```

**Expected Response:**
```json
{
  "success": true,
  "playlists": [
    {
      "playlistId": "playlist-id-1",
      "userId": "user-uuid",
      "playlistName": "My Favorite Songs",
      "userName": "JohnDoe",
      "email": "john@example.com",
      "songs": ["song-id-1", "song-id-2"]
    },
    {
      "playlistId": "playlist-id-2",
      "userId": "user-uuid",
      "playlistName": "Workout Mix",
      "userName": "JohnDoe",
      "email": "john@example.com",
      "songs": ["song-id-3"]
    }
  ]
}
```

---

### Get Playlists (Search with Filters)
**GET** `http://localhost:4000/store/playlist`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "playlistName": "Favorite",
  "userName": "John",
  "title": "Bohemian",
  "artist": "Queen",
  "year": "1975"
}
```

**Expected Response:**
```json
{
  "success": true,
  "playlists": [
    {
      "playlistId": "playlist-id-1",
      "userId": "user-uuid",
      "playlistName": "My Favorite Songs",
      "userName": "JohnDoe",
      "email": "john@example.com",
      "songs": ["song-id-1", "song-id-2"]
    }
  ]
}
```

---

### Get All Playlists
**GET** `http://localhost:4000/store/playlist/all`

**Headers:**
```
(No headers needed - cookie is sent automatically)
```

**Expected Response:**
```json
{
  "success": true,
  "playlists": [
    {
      "playlistId": "playlist-id-1",
      "userId": "user-uuid-1",
      "playlistName": "My Favorite Songs",
      "userName": "JohnDoe",
      "email": "john@example.com",
      "songs": ["song-id-1", "song-id-2"]
    },
    {
      "playlistId": "playlist-id-2",
      "userId": "user-uuid-2",
      "playlistName": "Chill Vibes",
      "userName": "JaneDoe",
      "email": "jane@example.com",
      "songs": ["song-id-3"]
    }
  ]
}
```

---

### Update Playlist
**PUT** `http://localhost:4000/store/playlist/:id`

**Example:**
```
PUT http://localhost:4000/store/playlist/abc123-playlist-id
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "playlistName": "Updated Playlist Name",
  "ownerEmail": "john@example.com",
  "songs": ["song-id-1", "song-id-2", "song-id-4", "song-id-5"]
}
```

**Expected Response:**
```json
{
  "success": true
}
```

---

### Delete Playlist By Id
**DELETE** `http://localhost:4000/store/playlist/:id`

**Example:**
```
DELETE http://localhost:4000/store/playlist/abc123-playlist-id
```

**Headers:**
```
(No headers needed - cookie is sent automatically)
```

**Expected Response:**
```json
{
  "success": true
}
```

---

## Postman Setup Tips

### 1. Enable Cookie Management
- Go to **Settings** (gear icon) → **General** tab
- Ensure **"Automatically follow redirects"** and **"Send cookies"** are enabled

### 2. Using Environment Variables
Create a Postman environment with these variables:
- `base_url`: `http://localhost:4000`
- `user_id`: (set after login)
- `playlist_id`: (set after creating a playlist)

Then use them in requests like:
```
{{base_url}}/store/playlist/{{playlist_id}}
```

### 3. Test Scripts (Optional)
Add this to your login request's **Tests** tab to save the user ID:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.user && response.user.userId) {
        pm.environment.set("user_id", response.user.userId);
    }
}
```

### 4. Pre-request Script for Cookie Handling
If cookies aren't working automatically, you can manually set them in a Pre-request Script:
```javascript
// This is usually not needed as Postman handles cookies automatically
// Only use if you're having cookie issues
```

---

## 3. Song Endpoints

### Create Song
**POST** `http://localhost:4000/store/songs`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "title": "Bohemian Rhapsody",
  "artist": "Queen",
  "year": "1975",
  "youtubeId": "fJ9rUzIMcZQ",
  "ownerEmail": "john@example.com"
}
```

**Expected Response:**
```json
{
  "success": true
}
```

---

### Get Target Songs (Search with Filters)
**GET** `http://localhost:4000/store/songs`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "title": "Bohemian Rhapsody",
  "artist": "Queen",
  "year": "1975"
}
```

**Expected Response:**
```json
{
  "success": true,
  "songs": [
    {
      "songId": "song-uuid-1",
      "title": "Bohemian Rhapsody",
      "artist": "Queen",
      "year": "1975",
      "youtubeId": "fJ9rUzIMcZQ",
      "listens": 0,
      "inPlaylists": [],
      "addedById": "user-uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get Song By Id
**GET** `http://localhost:4000/store/songs/:id`

**Example:**
```
GET http://localhost:4000/store/songs/song-uuid-here
```

**Headers:**
```
(No headers needed - cookie is sent automatically)
```

**Expected Response:**
```json
{
  "success": true,
  "song": {
    "songId": "song-uuid-here",
    "title": "Bohemian Rhapsody",
    "artist": "Queen",
    "year": "1975",
    "youtubeId": "fJ9rUzIMcZQ",
    "listens": 0,
    "inPlaylists": ["playlist-id-1"],
    "addedById": "user-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Edit Song By Id
**PUT** `http://localhost:4000/store/songs/:id`

**Example:**
```
PUT http://localhost:4000/store/songs/song-uuid-here
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "title": "Bohemian Rhapsody (Remastered)",
  "artist": "Queen",
  "year": "1975",
  "youtubeId": "fJ9rUzIMcZQ"
}
```

**Expected Response:**
```json
{
  "success": true
}
```

---

### Get All Songs In Playlist
**GET** `http://localhost:4000/store/songs/:playlistId`

**Example:**
```
GET http://localhost:4000/store/songs/playlist-id-here
```

**Note:** This endpoint uses the same route pattern as `Get Song By Id`, but expects a playlist ID instead. The router may need to handle this differently in practice.

**Headers:**
```
(No headers needed - cookie is sent automatically)
```

**Expected Response:**
```json
{
  "success": true,
  "songs": [
    "song-id-1",
    "song-id-2",
    "song-id-3"
  ]
}
```

---

### Get User Songs
**GET** `http://localhost:4000/store/userSongs/:id`

**Example:**
```
GET http://localhost:4000/store/userSongs/user-uuid-here
```

**Headers:**
```
(No headers needed - cookie is sent automatically)
```

**Expected Response:**
```json
{
  "success": true,
  "songs": [
    {
      "songId": "song-uuid-1",
      "title": "Bohemian Rhapsody",
      "artist": "Queen",
      "year": "1975",
      "youtubeId": "fJ9rUzIMcZQ",
      "listens": 0,
      "inPlaylists": ["playlist-id-1"],
      "addedById": "user-uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "songId": "song-uuid-2",
      "title": "Stairway to Heaven",
      "artist": "Led Zeppelin",
      "year": "1971",
      "youtubeId": "QkF3oxziUI4",
      "listens": 5,
      "inPlaylists": [],
      "addedById": "user-uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Delete Song By Id
**DELETE** `http://localhost:4000/store/songs/:id`

**Example:**
```
DELETE http://localhost:4000/store/songs/song-uuid-here
```

**Headers:**
```
(No headers needed - cookie is sent automatically)
```

**Expected Response:**
```json
{
  "success": true,
  "song": {
    "songId": "song-uuid-here",
    "title": "Bohemian Rhapsody",
    "artist": "Queen",
    "year": "1975",
    "youtubeId": "fJ9rUzIMcZQ",
    "listens": 0,
    "inPlaylists": [],
    "addedById": "user-uuid"
  }
}
```

**Note:** You can only delete songs that you created (where `addedById` matches your `userId`).

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "loggedIn": false,
  "user": null,
  "errorMessage": "Unauthorized"
}
```
*Solution: Make sure you've logged in first and the cookie is being sent.*

### 400 Bad Request
```json
{
  "success": false,
  "error": "Please provide all required fields."
}
```
*Solution: Check that all required fields are included in the request body.*

### 404 Not Found
```json
{
  "errorMessage": "Playlist not found!"
}
```
*Solution: Verify the playlist ID exists and belongs to the authenticated user.*


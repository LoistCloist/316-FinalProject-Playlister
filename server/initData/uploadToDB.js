const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();
const db = require('../db');
const User = require('../schemas/user-model');
const Playlist = require('../schemas/playlist-model');
const Song = require('../schemas/song-model');
const DEFAULT_YOUTUBE_ID = 'OTg5Bs7AXNU';

// helper function to convert image file to base64 data url string
// this is the server-side equivalent of url.createobjecturl for database storage
function imageFileToBase64DataURL(imagePath) {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const imageBase64 = imageBuffer.toString('base64');
        const ext = path.extname(imagePath).toLowerCase();
        
        // determine mime type based on file extension
        const mimeTypes = {
            '.webp': 'image/webp',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml'
        };
        const mimeType = mimeTypes[ext] || 'image/webp';
        
        return `data:${mimeType};base64,${imageBase64}`;
    } catch (error) {
        console.error(`Error reading image file ${imagePath}:`, error);
        return null;
    }
}

async function uploadData() {
    try {
        await new Promise((resolve, reject) => {
            db.once('open', resolve);
            db.on('error', reject);
        });
        console.log('Connected to database');

        const dataPath = path.join(__dirname, 'PlaylisterData.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(rawData);
        
        console.log(`Loaded ${data.users.length} users and ${data.playlists.length} playlists`);

        const songMap = new Map(); // key: "title|artist|year|youtubeId", value: {songId, songData}
        const userMap = new Map(); // key: email, value: {userId, userData}
        const playlistMap = new Map(); // key: playlistId, value: {playlistData}
        const songIdToPlaylistIds = new Map(); // key: songId, value: Set of playlistIds
        
        data.playlists.forEach((playlist, playlistIndex) => {
            playlist.songs.forEach(song => {
                // Use default youtubeId if not provided or empty
                const youtubeId = song.youTubeId || DEFAULT_YOUTUBE_ID;
                
                // creating a unique key/set for song deduplication
                const songKey = `${song.title}|${song.artist}|${song.year}|${youtubeId}`;
                
                if (!songMap.has(songKey)) {
                    const songId = randomUUID();
                    songMap.set(songKey, {
                        songId,
                        title: song.title,
                        artist: song.artist,
                        year: String(song.year), // Convert to string as per schema
                        youtubeId: youtubeId, // Use default if not provided
                        listens: 0, // Default value
                        inPlaylists: [],
                        addedById: null // Will be set when we create users
                    });
                }
            });
        });
        console.log(`Found ${songMap.size} unique songs`);

        const defaultPassword = 'stupidusershouldnthavepasswords'; // Or generate random passwords
        const saltRounds = 10;
        
        // load default avatar image and convert to Base64 data URL
        const defaultAvatarPath = path.join(__dirname, '../assets/Hot-European-and-American-Fashion-Wig-Female-Head-Lace-Various-Short-Straight-Bob-Lace-Front-Human-Hair-Wig-Full-Human-Hair-Wigs.webp');
        const defaultAvatar = imageFileToBase64DataURL(defaultAvatarPath);
        
        if (!defaultAvatar) {
            console.warn('Warning: Could not load default avatar image. Using empty string.');
        }
        
        for (const userData of data.users) {
            const userId = randomUUID();
            const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);
            
            userMap.set(userData.email, {
                userId,
                userName: userData.name,
                email: userData.email,
                passwordHash,
                avatar: defaultAvatar || '', // Use default avatar image
                playlists: []
            });
        }
        console.log(`Created ${userMap.size} user mappings`);

        for (const playlistData of data.playlists) {
            const playlistId = randomUUID();
            const ownerEmail = playlistData.ownerEmail;
            const user = userMap.get(ownerEmail);
            
            if (!user) {
                console.warn(`User not found for email: ${ownerEmail}`);
                continue;
            }

            // Convert song objects to songIds
            const songIds = [];
            playlistData.songs.forEach(song => {
                const youtubeId = song.youTubeId || DEFAULT_YOUTUBE_ID;
                const songKey = `${song.title}|${song.artist}|${song.year}|${youtubeId}`;
                const songInfo = songMap.get(songKey);
                if (songInfo) {
                    songIds.push(songInfo.songId);
                    if (!songIdToPlaylistIds.has(songInfo.songId)) {
                        songIdToPlaylistIds.set(songInfo.songId, new Set());
                    }
                    songIdToPlaylistIds.get(songInfo.songId).add(playlistId);
                }
            });

            playlistMap.set(playlistId, {
                playlistId,
                userId: user.userId,
                playlistName: playlistData.name,
                userName: user.userName,
                email: user.email,
                songs: songIds
            });

            // Add playlistId to user's playlists array
            user.playlists.push(playlistId);
        }
        console.log(`Created ${playlistMap.size} playlist mappings`);

        // For each song, find which playlists contain it and set addedById
        for (const [songKey, songInfo] of songMap.entries()) {
            const playlistIds = songIdToPlaylistIds.get(songInfo.songId) || new Set();
            songInfo.inPlaylists = Array.from(playlistIds);
            
            // Set addedById to the first user who has this song in their playlist
            for (const [playlistId, playlist] of playlistMap.entries()) {
                if (playlist.songs.includes(songInfo.songId)) {
                    songInfo.addedById = playlist.userId;
                    break;
                }
            }
        }

        // Insert songs
        const songsToInsert = Array.from(songMap.values());
        await Song.insertMany(songsToInsert);
        console.log(`Inserted ${songsToInsert.length} songs`);

        // insert users
        const usersToInsert = Array.from(userMap.values());
        await User.insertMany(usersToInsert);
        console.log(`Inserted ${usersToInsert.length} users`);

        const playlistsToInsert = Array.from(playlistMap.values());
        await Playlist.insertMany(playlistsToInsert);
        console.log(`Inserted ${playlistsToInsert.length} playlists`);

        console.log('Data upload complete!');
        process.exit(0);

    } catch (error) {
        console.error('Error uploading data:', error);
        process.exit(1);
    }
}

uploadData();

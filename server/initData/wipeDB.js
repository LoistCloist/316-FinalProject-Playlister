// WARNING: This will delete ALL users, playlists, and songs!
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const User = require('../schemas/user-model');
const Playlist = require('../schemas/playlist-model');
const Song = require('../schemas/song-model');

async function wipeDatabase() {
    try {
        // Connect to database if not already connected
        if (mongoose.connection.readyState === 1) {
            console.log('Already connected to database');
        } else {
            await mongoose.connect(process.env.DB_CONNECT);
            console.log('Connected to database');
        }

        console.log('Starting database wipe...');
        
        const songResult = await Song.deleteMany({});
        console.log(`Deleted ${songResult.deletedCount} songs`);

        const playlistResult = await Playlist.deleteMany({});
        console.log(`Deleted ${playlistResult.deletedCount} playlists`);

        const userResult = await User.deleteMany({});
        console.log(`Deleted ${userResult.deletedCount} users`);

        console.log('Database wipe complete!');
        process.exit(0);

    } catch (error) {
        console.error('Error wiping database:', error);
        process.exit(1);
    }
}

wipeDatabase();


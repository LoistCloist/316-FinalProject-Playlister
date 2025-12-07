// WARNING: This will delete ALL users, playlists, and songs!
const dotenv = require('dotenv');
dotenv.config();
const db = require('../db');
const User = require('../schemas/user-model');
const Playlist = require('../schemas/playlist-model');
const Song = require('../schemas/song-model');

async function wipeDatabase() {
    try {
        await new Promise((resolve, reject) => {
            db.once('open', resolve);
            db.on('error', reject);
        });
        console.log('Connected to database');

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


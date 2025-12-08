const Playlist = require('../schemas/playlist-model')
const User = require('../schemas/user-model')
const Song = require('../schemas/song-model')
const { randomUUID } = require('crypto')
const auth = require('../auth')

createPlaylist = async (req, res) => {
    // if invalid user is given in request.
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const { playlistName, userName, email, songs } = req.body;
    if (!playlistName || !userName || !email || !songs) {
        return res.status(400).json({
            success: false,
            error: 'Please provide all required fields.'
        })
    }
    const playlistId = randomUUID();
    try {
        const mongooseUserId = auth.verifyUser(req);
        const user = await User.findOne({ _id: mongooseUserId });
        if (!user) {
            return res
                    .status(400)
                    .json({
                        errorMessage: "User not found for CreatePlaylist!"
                    })
        }
        const playlist = await Playlist.create({
            playlistId: playlistId,
            userId: user.userId, 
            playlistName: playlistName,
            userName: userName,
            email: email,
            songs: songs,
            listeners: [] // Initialize empty listeners array
        })
        user.playlists.push(playlist.playlistId);
        await user.save();
        return res.status(200).json({ 
            success: true,
            playlistId: playlist.playlistId
        });
    } catch (error) {
        console.error("Error creating playlist:", error);
        return res.status(400).json({
            errorMessage: "Error creating new playlist",
            error: error.message
        })
    }
}

deletePlaylistById = async (req, res) => {
    // req gets req.userId field (mongoose _id)
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    // You can only delete playlists that belong to the user.
    const playlist = await Playlist.findOne({ playlistId: req.params.id });
    if (!playlist) {
        return res
                .status(404).json({
                    errorMessage: 'Playlist not found!'
                })
    }

    // Get the user's UUID (not mongoose _id) for comparison
    const user = await User.findOne({ _id: req.userId });
    if (!user) {
        return res.status(400).json({
            errorMessage: "User not found."
        })
    }
    
    if (playlist.userId === user.userId) {
        // remove playlist from user's playlists array
        user.playlists = user.playlists.filter(id => id !== playlist.playlistId);
        await user.save();
        
        // delete the playlist
        await Playlist.findOneAndDelete({ playlistId: req.params.id });
        return res.status(200).json({ success: true });
    }
    else {
        return res.status(400).json({
            errorMessage: "Authentication error. Incorrect user!"
        })
    }
}

getPlaylists = async (req, res) => {
    // Support both GET (query params) and POST (body) for backward compatibility
    const { playlistName, userName, title, artist, year } = req.method === 'GET' ? req.query : req.body;
    
    // Require at least one field
    if (!playlistName && !userName && !title && !artist && !year) {
        return res.status(400).json({
            errorMessage: "Please provide at least one search field."
        })
    }
    
    // Build song query with only provided fields
    const songQuery = {};
    if (title) {
        songQuery.title = { $regex: title, $options: 'i' };
    }
    if (artist) {
        songQuery.artist = { $regex: artist, $options: 'i' };
    }
    if (year) {
        songQuery.year = { $regex: year, $options: 'i' };
    }
    
    // Build playlist query
    const playlistQuery = {};
    if (playlistName) {
        playlistQuery.playlistName = { $regex: playlistName, $options: 'i' };
    }
    if (userName) {
        playlistQuery.userName = { $regex: userName, $options: 'i' };
    }
    
    // If song search criteria are provided, find matching songs first
    let songIds = [];
    if (title || artist || year) {
        const songDocuments = await Song.find(songQuery).select('songId');
        if (songDocuments && songDocuments.length > 0) {
            songIds = songDocuments.map(song => song.songId);
            playlistQuery.songs = { $in: songIds };
        } else {
            // No songs match, so no playlists can match
            return res.status(200).json({ 
                success: true, 
                playlists: [] 
            });
        }
    }
    
    const playlists = await Playlist.find(playlistQuery);
    
    // Fetch user avatars and populate songs for all playlists
    const playlistsWithAvatars = await Promise.all(
        playlists.map(async (playlist) => {
            const user = await User.findOne({ userId: playlist.userId });
            
            // Populate songs with full song objects
            const songObjects = await Promise.all(
                (playlist.songs || []).map(async (songId) => {
                    const song = await Song.findOne({ songId: songId });
                    return song ? song.toObject() : null;
                })
            );
            // Filter out any null songs (in case a song was deleted)
            const validSongs = songObjects.filter(song => song !== null);
            
            return {
                ...playlist.toObject(),
                songs: validSongs,
                userAvatar: user ? user.avatar : null
            };
        })
    );
    
    return res.status(200).json({ 
        success: true, 
        playlists: playlistsWithAvatars || [] 
    });
}

// you shouldn't need to check if the playlist belongs to this user before returning.
getPlaylistById = async (req, res) => {
    const playlist = await Playlist.findOne({ playlistId: req.params.id });
    if (!playlist) {
        return res.status(404).json({ 
            success: false, 
            errorMessage: "Playlist not found!" 
        })
    }
    // Fetch user icon (avatar) and populate songs
    const user = await User.findOne({ userId: playlist.userId });
    
    // Populate songs with full song objects
    const songObjects = await Promise.all(
        (playlist.songs || []).map(async (songId) => {
            const song = await Song.findOne({ songId: songId });
            return song ? song.toObject() : null;
        })
    );
    // Filter out any null songs (in case a song was deleted)
    const validSongs = songObjects.filter(song => song !== null);
    
    const playlistWithAvatar = {
        ...playlist.toObject(),
        songs: validSongs,
        userAvatar: user ? user.avatar : null
    };
    return res
            .status(200)
            .json({ success: true, playlist: playlistWithAvatar })
}
// this method might need to check if the one making the requests matches the parameter id.
getUserPlaylists = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const userid = req.params.userid;
    if (!userid) {
        return res.status(400).json({
            errorMessage: "User id is missing."
        })
    }
    const user = await User.findOne({ userId: userid });
    if (!user) {
        return res.status(404).json({
            errorMessage: "User not found!"
        })
    }
    // Use the playlistIds array from the user document
    if (!user.playlists || user.playlists.length === 0) {
        return res.status(200).json({
            success: true,
            playlists: []
        })
    }
    const playlists = await Playlist.find({ playlistId: { $in: user.playlists } });
    
    // Fetch user avatars and populate songs for all playlists
    const playlistsWithAvatars = await Promise.all(
        playlists.map(async (playlist) => {
            const playlistUser = await User.findOne({ userId: playlist.userId });
            
            // Populate songs with full song objects
            const songObjects = await Promise.all(
                (playlist.songs || []).map(async (songId) => {
                    const song = await Song.findOne({ songId: songId });
                    return song ? song.toObject() : null;
                })
            );
            // Filter out any null songs (in case a song was deleted)
            const validSongs = songObjects.filter(song => song !== null);
            
            return {
                ...playlist.toObject(),
                songs: validSongs,
                userAvatar: playlistUser ? playlistUser.avatar : null
            };
        })
    );
    
    return res.status(200).json({
        success: true,
        playlists: playlistsWithAvatars
    })
}

getAllPlaylists = async (req, res) => {
    try {
        const allPlaylists = await Playlist.find({});
        
        // Fetch user avatars and populate songs for all playlists
        const playlistsWithAvatars = await Promise.all(
            allPlaylists.map(async (playlist) => {
                const user = await User.findOne({ userId: playlist.userId });
                
                // Populate songs with full song objects
                const songObjects = await Promise.all(
                    (playlist.songs || []).map(async (songId) => {
                        const song = await Song.findOne({ songId: songId });
                        return song ? song.toObject() : null;
                    })
                );
                // Filter out any null songs (in case a song was deleted)
                const validSongs = songObjects.filter(song => song !== null);
                
                return {
                    ...playlist.toObject(),
                    songs: validSongs,
                    userAvatar: user ? user.avatar : null
                };
            })
        );
        
        return res.status(200).json({ 
            success: true, 
            playlists: playlistsWithAvatars || [] 
        });
    } catch (error) {
        console.error("Error getting all playlists:", error);
        return res.status(500).json({
            errorMessage: "Error retrieving playlists"
        });
    }
}

updatePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const { playlistName, songs } = req.body;
    if (!playlistName || !songs ) {
        return res.status(400).json({ errorMessage: "Some fields missing..."});
    }
    // Find playlist by playlistId from URL params
    const playlist = await Playlist.findOne({ playlistId: req.params.id });
    if (!playlist) {
        return res.status(404).json({ errorMessage: "Playlist not found!"})
    }
    
    // Get the user's UUID (not mongoose _id) for comparison
    const user = await User.findOne({ _id: req.userId });
    if (!user) {
        return res.status(400).json({
            errorMessage: "User not found."
        })
    }
    
    // Compare playlist userId (UUID) with user userId (UUID)
    if (playlist.userId !== user.userId) {
        return res.status(400).json( {errorMessage: "Incorrect user. Authentication failed."})
    }
    
    const playlistId = playlist.playlistId;
    const oldSongIds = playlist.songs || [];
    const newSongIds = songs || [];
    
    // Find songs that were removed (in old but not in new)
    const removedSongIds = oldSongIds.filter(songId => !newSongIds.includes(songId));
    // Find songs that were added (in new but not in old)
    const addedSongIds = newSongIds.filter(songId => !oldSongIds.includes(songId));
    
    // Remove playlistId from removed songs' inPlaylists
    for (const songId of removedSongIds) {
        const song = await Song.findOne({ songId: songId });
        if (song && song.inPlaylists) {
            song.inPlaylists = song.inPlaylists.filter(pid => pid !== playlistId);
            await song.save();
        }
    }
    
    // Add playlistId to added songs' inPlaylists
    for (const songId of addedSongIds) {
        const song = await Song.findOne({ songId: songId });
        if (song) {
            if (!song.inPlaylists) {
                song.inPlaylists = [];
            }
            if (!song.inPlaylists.includes(playlistId)) {
                song.inPlaylists.push(playlistId);
                await song.save();
            }
        }
    }
    
    playlist.playlistName = playlistName;
    playlist.songs = songs;
    await playlist.save();
    return res.status(200).json({ success: true });
}

addListener = async (req, res) => {
    const playlistId = req.params.id;
    if (!playlistId) {
        return res.status(400).json({
            errorMessage: "Playlist ID is required."
        });
    }
    
    const playlist = await Playlist.findOne({ playlistId: playlistId });
    if (!playlist) {
        return res.status(404).json({
            errorMessage: "Playlist not found!"
        });
    }
    
    // Determine listener ID: "guest" for unauthenticated users, userId for authenticated users
    let listenerId;
    const mongooseUserId = auth.verifyUser(req);
    if (mongooseUserId === null) {
        // Guest user
        listenerId = "guest";
    } else {
        // Authenticated user - get their userId
        const user = await User.findOne({ _id: mongooseUserId });
        if (!user) {
            return res.status(400).json({
                errorMessage: "User not found."
            });
        }
        listenerId = user.userId;
    }
    
    // Initialize listeners array if it doesn't exist
    if (!playlist.listeners) {
        playlist.listeners = [];
    }
    
    // Add listener only if not already in array (unique constraint)
    if (!playlist.listeners.includes(listenerId)) {
        playlist.listeners.push(listenerId);
        await playlist.save();
    }
    
    return res.status(200).json({
        success: true,
        listeners: playlist.listeners
    });
}

addSongToPlaylist = async (req, res) => {
    const playlistId = req.params.id;
    const { songId } = req.body;
    
    if (!playlistId || !songId) {
        return res.status(400).json({
            errorMessage: "Playlist ID and Song ID are required."
        });
    }
    
    // Check if user is authenticated (required to add songs)
    const mongooseUserId = auth.verifyUser(req);
    if (mongooseUserId === null) {
        return res.status(401).json({
            errorMessage: "UNAUTHORIZED - Must be logged in to add songs to playlists."
        });
    }
    
    const user = await User.findOne({ _id: mongooseUserId });
    if (!user) {
        return res.status(400).json({
            errorMessage: "User not found."
        });
    }
    
    const playlist = await Playlist.findOne({ playlistId: playlistId });
    if (!playlist) {
        return res.status(404).json({
            errorMessage: "Playlist not found!"
        });
    }
    
    // Check if user owns the playlist (required to add songs)
    if (playlist.userId !== user.userId) {
        return res.status(403).json({
            errorMessage: "You can only add songs to playlists you own."
        });
    }
    
    // Check if song already exists in playlist
    if (playlist.songs && playlist.songs.includes(songId)) {
        return res.status(200).json({
            success: true,
            message: "Song already in playlist",
            playlist: playlist
        });
    }
    
    // Add song ID to the playlist (append, not replace)
    // Note: We don't check if the user owns the song - anyone can add any song to their own playlist
    if (!playlist.songs) {
        playlist.songs = [];
    }
    playlist.songs.push(songId);
    await playlist.save();
    
    // Update the song's inPlaylists array to include this playlist
    const song = await Song.findOne({ songId: songId });
    if (song) {
        if (!song.inPlaylists) {
            song.inPlaylists = [];
        }
        // Add playlistId if not already in the array
        if (!song.inPlaylists.includes(playlistId)) {
            song.inPlaylists.push(playlistId);
            await song.save();
        }
    }
    
    return res.status(200).json({
        success: true,
        playlist: playlist
    });
}

duplicatePlaylist = async (req, res) => {
    const playlistId = req.params.id;
    
    if (!playlistId) {
        return res.status(400).json({
            errorMessage: "Playlist ID is required."
        });
    }
    
    // Check if user is authenticated (required to duplicate playlists)
    const mongooseUserId = auth.verifyUser(req);
    if (mongooseUserId === null) {
        return res.status(401).json({
            errorMessage: "UNAUTHORIZED - Must be logged in to duplicate playlists."
        });
    }
    
    const user = await User.findOne({ _id: mongooseUserId });
    if (!user) {
        return res.status(400).json({
            errorMessage: "User not found."
        });
    }
    
    // Find the playlist to duplicate
    const originalPlaylist = await Playlist.findOne({ playlistId: playlistId });
    if (!originalPlaylist) {
        return res.status(404).json({
            errorMessage: "Playlist not found!"
        });
    }
    
    // Create new playlist with duplicated data
    const newPlaylistId = randomUUID();
    const newPlaylist = await Playlist.create({
        playlistId: newPlaylistId,
        userId: user.userId, // New owner is the current user
        playlistName: originalPlaylist.playlistName, // Will be updated with counter on frontend
        userName: user.userName,
        email: user.email,
        songs: originalPlaylist.songs ? [...originalPlaylist.songs] : [], // Duplicate song IDs
        listeners: [] // Start with empty listeners
    });
    
    // Add playlist to user's playlists array
    user.playlists.push(newPlaylist.playlistId);
    await user.save();
    
    // Update songs' inPlaylists arrays to include the new playlist
    if (originalPlaylist.songs && originalPlaylist.songs.length > 0) {
        for (const songId of originalPlaylist.songs) {
            const song = await Song.findOne({ songId: songId });
            if (song) {
                if (!song.inPlaylists) {
                    song.inPlaylists = [];
                }
                if (!song.inPlaylists.includes(newPlaylistId)) {
                    song.inPlaylists.push(newPlaylistId);
                    await song.save();
                }
            }
        }
    }
    
    return res.status(200).json({
        success: true,
        playlist: newPlaylist.toObject()
    });
}

module.exports = {
    createPlaylist,
    deletePlaylistById,
    getPlaylists,
    getPlaylistById,
    getUserPlaylists,
    getAllPlaylists,
    updatePlaylist,
    addListener,
    addSongToPlaylist,
    duplicatePlaylist
}
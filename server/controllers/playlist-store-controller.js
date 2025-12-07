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
            songs: songs
        })
        user.playlists.push(playlist.playlistId);
        await user.save();
        return res.status(200).json({ success: true });
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
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const { playlistName, userName, title, artist, year } = req.body;
    
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
    
    // Fetch user avatars for all playlists
    // don't want to store avatar twice.
    const playlistsWithAvatars = await Promise.all(
        playlists.map(async (playlist) => {
            const user = await User.findOne({ userId: playlist.userId });
            return {
                ...playlist.toObject(),
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
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const playlist = await Playlist.findOne({ playlistId: req.params.id });
    if (!playlist) {
        return res.status(404).json({ 
            success: false, 
            errorMessage: "Playlist not found!" 
        })
    }
    // Fetch user icon (avatar) associated with the playlist's userId
    const user = await User.findOne({ userId: playlist.userId });
    const playlistWithAvatar = {
        ...playlist.toObject(),
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
    
    // Fetch user avatars for all playlists
    const playlistsWithAvatars = await Promise.all(
        playlists.map(async (playlist) => {
            const playlistUser = await User.findOne({ userId: playlist.userId });
            return {
                ...playlist.toObject(),
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
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    try {
        const allPlaylists = await Playlist.find({});
        
        // Fetch user avatars for all playlists
        const playlistsWithAvatars = await Promise.all(
            allPlaylists.map(async (playlist) => {
                const user = await User.findOne({ userId: playlist.userId });
                return {
                    ...playlist.toObject(),
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
    playlist.playlistName = playlistName;
    playlist.songs = songs;
    await playlist.save();
    return res.status(200).json({ success: true });
}

module.exports = {
    createPlaylist,
    deletePlaylistById,
    getPlaylists,
    getPlaylistById,
    getUserPlaylists,
    getAllPlaylists,
    updatePlaylist
}
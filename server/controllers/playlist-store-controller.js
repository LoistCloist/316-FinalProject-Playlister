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
    // req gets req.userId field
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    // You can only delete playlists that belong to the user.
    playlist = await Playlist.findById({ playlistId: req.params.id });
    if (!playlist) {
        return res
                .status(404).json({
                    errorMessage: 'Playlist not found!'
                })
    }

    user = await User.findOne({ email: playlist.email });
    if (req.userId == user.userId) {
        Playlist.findOneAndDelete({ playlistId: req.params.id }, () => {
            return res.status(200).json({ success: true });
        }).catch(err => console.log(err))
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
    return res.status(200).json({ 
        success: true, 
        playlists: playlists || [] 
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
    return res
            .status(200)
            .json({ success: true, playlist: playlist })
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
    return res.status(200).json({
        success: true,
        playlists: playlists
    })
}

getAllPlaylists = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const allPlaylists = await Playlist.find({});
    if (!allPlaylists) {
        return res
                .status(404)
                .json({
                    errorMessage: "Playlists not found or no playlists exist"
                })
    }
    return res.status(200).json({ success: true, playlists: allPlaylists});
}

updatePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const { playlistName, ownerEmail, songs } = req.body;
    if (!playlistName || !ownerEmail || !songs ) {
        return res.status(400).json({ errorMessage: "Some fields missing..."});
    }
    // check if user should be allowed to get this playlist
    playlist = await Playlist.findOne({ playlistId: req.userId });
    if (!playlist) {
        return res.status(404).json({ errorMessage: "Playlist not found!"})
    }
    if (playlist.userId !== req.userId) {
        return res.status(400).json( {errorMessage: "Incorrect user. Authentication failed."})
    }
    playlist.playlistName = playlistName;
    playlist.email = ownerEmail;
    playlist.songs = songs
    await playlist.save();
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
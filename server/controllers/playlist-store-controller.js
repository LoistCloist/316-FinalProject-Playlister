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
        const user = await User.findOne({ _id: req.userId });
        if (!user) {
            return res
                    .status(400)
                    .json({
                        errorMessage: "User not found for CreatePlaylist!"
                    })
        }
        const playlist = Playlist.create({
            playlistId: playlistId,
            userId: userId,
            playlistName: playlistName,
            userName: userName,
            email: email,
            songs: songs
        })
        user.playlists.push(playlist.playlistId);
        await user.save();
        await playlist.save();
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(400).json({
            errorMessage: "Error creating new playlist"
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
    // check if 
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

getPlaylists(playlistName, userName, title, artist, year) = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    // intializing the regex for all fields.
    const playlistNameRegex = new RegExp(playlistName, 'i');
    const userNameRegex = new RegExp(playlistName, 'i');
    const titleRegex = new RegExp(playlistName, 'i');
    const artistRegex = new RegExp(playlistName, 'i');
    const yearRegex = new RegExp(playlistName, 'i');

    // get a list of songIds that fulfill the title, artist, and year
    const songIds = await Song
                            .find({
                                title: { $regex: titleRegex }, 
                                artist: { $regex: artistRegex }, 
                                year: { $regex: yearRegex } 
                            })
                            .select('songId');
    if (!songIds) {
        return res.status(400).json({
            errorMessage: "No songs matching criteria found!"
        })
    }
    const playlists = await Playlist.find({
        playlistName: { $regex: playlistNameRegex },
        email: { $regex: userNameRegex },
        songs: { $in: songIdds }
    })
    if (!playlists) {
        return res.status(404).json({
            errorMessage: "No playlists matching criteria found!"
        })
    }
    return res.status(200).json({ success: true, playlists: playlists})
    
}

// you shouldn't need to check if the playlist belongs to this user before returning.
getPlaylistById = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    playlist = await Playlist.findById({ playlistId: req.params.id });
    if (!playlist) {
        return res.status(400).json({ success: false, error: err})
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
    user_id = req.params.user_id;
    if (!user_id) {
        res.status(400).json({
            errorMessage: "User id is missing."
        })
    }
    user = await User.find({ userId: user_id });
    if (!user) {
        res.status(404).json({
            errorMessage: "User not found!"
        })
    }
    playlists = await Playlist.find({ userId: user.userId });
    if (!playlists) {
        return res.status(404).json({
            errorMessage: "Playlists belong to user not found!"
        })
    }
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
    const { name, ownerEmail, songs } = req.body;
    if (!name || !ownerEmail || !songs ) {
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
    playlist.playlistName = name;
    playlist.email = ownerEmail;
    playlist.songs = songs
    await playlist.save();
}

module.exports = {
    createPlaylist,
    deletePlaylistById,
    getPlaylist,
    getPlaylistById,
    getUserPlaylists,
    getAllPlaylists,
    updatePlaylist
}
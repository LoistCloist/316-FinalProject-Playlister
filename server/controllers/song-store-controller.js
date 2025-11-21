const Playlist = require('../schemas/playlist-model')
const User = require('../schemas/user-model')
const Song = require('../schemas/song-model')
const auth = require('../auth')
const { randomUUID } = require('crypto');


createSong = async (req, res) => {
    // add to song catalog
    // check if the requeest is coming from a valid user.
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessages: 'UNAUTHORIZED'
        })
    }
    const { title, artist, year, youtubeId, ownerEmail } = body
    if (!title || !artist || !year || !youtubeId || !ownerEmail ) {
        return res.status(400).json({
            errorMessage: 'Missing fields'
        })
    }
    songId = randomeUUID();
    try {
        await Song.create({
            songId: songId,
            title: title,
            artist: artist,
            year: year,
            youtubeId: youtubeId,
            listens: 0,
            inPlaylists: []
        })
        return res.status(200).json({ success: true })
    } catch (err) {
        return res.status(400).json({
            errorMessage: "Song creation failed."
        })
    }
}

getTargetSongs = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessages: 'UNAUTHORIZED'
        })
    }
    const { title, artist, year } = req.body
    if (!title || !artist || !year) {
        return res.status(400).json({ errorMessage: "Please include all fields. "});
    }
    songs = Song.find({ title: title, artist: artist, year: year });
    if (!songs) {
        return res.status(404).json({ errorMessage: "No songs found with given criteria."});
    }
    return res.status(200).json({
        success: true,
        songs: songs
    })
}

getSongById = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessages: 'UNAUTHORIZED'
        })
    }
    song = await Song.findOne({ songId: req.params.id})
    if (!song) {
        return res.status(404).json({ errorMessage: "Song does not exist!"})
    }
    return res.status(200).json({ success: true, song: song});
}

editSongById = async (req, res) => {
    if (auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessages: 'UNAUTHORIZED'
        })
    }
    const { title, artist, year, youtubeId } = req.body;
    if (!title || !artist || !year || !youtubeId) {
        return res.status(400).json({ errorMessage: "Required fields not added. "});
    }
    // get song by Id
    song = await Song.findOne({ songId: req.params.id });
    if (!song) {
        return res.status(404).json({ errorMessage: "Song to edit does not exist."});
    }
    song.title = title;
    song.artist = artist;
    song.year = year;
    song.youtubeId = youtubeId;
    try {
        await song.save();
    } catch (err) {
        return res.status(400).json({ errorMessage: "Failed to save edited song to database."});
    }
}

getAllSongsInPlaylist = async (req, res) => {
    if (auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessages: 'UNAUTHORIZED'
        })
    }
    playlistId = req.params.id;
    if (!playlistId) {
        return res.status(400).json({
            errorMessages: "Invalid playlist id or not included."
        })
    }
    playlist = await Playlist.findOne({ playlistId: req.params.id});
    if (!playlist.songs) {
        return res.status(404).json({
            errorMessage: "getAllSongsInPlaylist - Could not find playlist or songs."
        })
    }
    return res.status(200).json({ success: true, songs: playlist.songs });
}

getUserSongs = async (req, res) => {
    if (auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessages: 'UNAUTHORIZED'
        })
    }
    user_id = req.params.id;
    if (!user_id) {
        return res.status(400).json({ errorMessage: "userId formatted incorrectly. "});
    }
    songs = await Song.find({ addedById: user_id })
    if (!songs) {
        return res.status(404).json({ errorMessage: "Songs added by userid not found."});
    }
    return res.status(200).json({ success: true, songs: songs});
}

deleteSongById = async (req, res) => {
    if (auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessages: 'UNAUTHORIZED'
        })
    }
    // check if user has the perms to delete.
    songId = req.params.id;
    if (!songId) {
        return res.status(400).json({
            errorMessage: "Incorrect or missing songId."
        });
    }
    song = await Song.findOne({ songId: songId });
    if (!song) {
        return res.status(404).json({
            errorMessage: "Cannot find song from given id."
        })
    }
    if (req.userId !== song.addedById) {
        return res.status(400).json({
            errorMessage: "User does not match owner. No authorization."
        })
    }
    deletedSong = await Song.findByIdAndDelete(song.songId);
    return res.status(200).json({ success: true, song: deletedSong });
}

module.exports = {
    createSong,
    getTargetSongs,
    getSongById,
    editSongById,
    getAllSongsInPlaylist,
    getUserSongs,
    deleteSongById
}
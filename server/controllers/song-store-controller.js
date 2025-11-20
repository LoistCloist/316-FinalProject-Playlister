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


module.exports = {
    createSong,
    getTargetSong,
    getSongById,
    editSongById,
    getAllSongsInPlaylist,
    getUserSongs,
    deleteSongById
}
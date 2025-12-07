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
    const { title, artist, year, youtubeId, ownerEmail } = req.body
    if (!title || !artist || !year || !youtubeId || !ownerEmail ) {
        return res.status(400).json({
            errorMessage: 'Missing fields'
        })
    }
    const songId = randomUUID();
    const mongooseUserId = auth.verifyUser(req);
    try {
        // Get the user's UUID (not the mongoose _id)
        const user = await User.findOne({ _id: mongooseUserId });
        if (!user) {
            return res.status(400).json({
                errorMessage: "User not found."
            })
        }
        await Song.create({
            songId: songId,
            title: title,
            artist: artist,
            year: year,
            youtubeId: youtubeId,
            listens: 0,
            inPlaylists: [],
            addedById: user.userId  // Use UUID, not mongoose _id
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
    if (!title && !artist && !year) {
        return res.status(400).json({ errorMessage: "Please include at least one search field."});
    }
    
    const query = {};
    if (title) {
        query.title = { $regex: title, $options: 'i' }; 
    }
    if (artist) {
        query.artist = { $regex: artist, $options: 'i' }; 
    }
    if (year) {
        query.year = { $regex: year, $options: 'i' };
    }
    
    const songs = await Song.find(query);
    if (!songs || songs.length === 0) {
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
    const song = await Song.findOne({ songId: req.params.id})
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
    const song = await Song.findOne({ songId: req.params.id });
    if (!song) {
        return res.status(404).json({ errorMessage: "Song to edit does not exist."});
    }
    song.title = title;
    song.artist = artist;
    song.year = year;
    song.youtubeId = youtubeId;
    try {
        await song.save();
        return res.status(200).json({ success: true });
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
    const playlistId = req.params.playlistId;
    if (!playlistId) {
        return res.status(400).json({
            errorMessages: "Invalid playlist id or not included."
        })
    }
    try {
        const playlist = await Playlist.findOne({ playlistId: playlistId });
        if (!playlist) {
            return res.status(404).json({
                errorMessage: "getAllSongsInPlaylist - Could not find playlist."
            })
        }
        if (!playlist.songs || playlist.songs.length === 0) {
            return res.status(200).json({ 
                success: true, 
                songs: [] 
            });
        }
        
        // Fetch all song objects using the song IDs from the playlist
        const songs = await Song.find({ 
            songId: { $in: playlist.songs } 
        });
        
        return res.status(200).json({ 
            success: true, 
            songs: songs 
        });
    } catch (error) {
        console.error('Error in getAllSongsInPlaylist:', error);
        return res.status(500).json({
            errorMessage: "Error fetching songs from playlist."
        })
    }
}

getUserSongs = async (req, res) => {
    if (auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessages: 'UNAUTHORIZED'
        })
    }
    const user_id = req.params.id;
    if (!user_id) {
        return res.status(400).json({ errorMessage: "userId formatted incorrectly. "});
    }
    const songs = await Song.find({ addedById: user_id })
    if (!songs || songs.length === 0) {
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
    const songId = req.params.id;
    if (!songId) {
        return res.status(400).json({
            errorMessage: "Incorrect or missing songId."
        });
    }
    const song = await Song.findOne({ songId: songId });
    if (!song) {
        return res.status(404).json({
            errorMessage: "Cannot find song from given id."
        })
    }
    // Get the user's UUID (not the mongoose _id) for comparison
    const user = await User.findOne({ _id: req.userId });
    if (!user) {
        return res.status(400).json({
            errorMessage: "User not found."
        })
    }
    if (user.userId !== song.addedById) {
        return res.status(400).json({
            errorMessage: "User does not match owner. No authorization."
        })
    }
    const deletedSong = await Song.findOneAndDelete({ songId: songId });
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
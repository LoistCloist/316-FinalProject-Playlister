const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Specifies the format of playlist data.
// We will only store songIds in the song arrays this time.

const playlistSchema = new Schema(
    {
        playlistId: { type: Number, required: true },
        userId: { type: String, required: true },
        playlistName: { type: String, required: true },
        userName: { type: String, required: true },
        email: { type: String, required: true },
        songs: [{ type: String, trim: true, required: true}]
    },
    { timestamps: true }
)

module.exports = mongoose.model('Playlist', playlistSchema)
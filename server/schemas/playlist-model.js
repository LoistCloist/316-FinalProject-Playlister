const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Specifies the format of playlist data.
// We will only store songIds in the song arrays this time.

const playlistSchema = new Schema(
    {
        id: { type: Number, required: true },
        name: { type: String, required: true },
        ownerEmail: { type: String, required: true },
        songs: [{ type: String, trim: true}]
    },
    { timestamps: true }
)

module.exports = mongoose.model('Playlist', playlistSchema)
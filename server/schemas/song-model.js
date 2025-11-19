const mongoose = require('mongoose')
const Schema = mongoose.Schema

const songSchema = new Schema(
    {
        id: { type: String, required: true },
                title: { type: String, required: true },
        artist: { type: String, required: true },
        year: { type: String, required: true },
        youtubeId: { type: String, required: true },
        listens: { type: Number, required: true },
        inPlaylists: [{ type: String, trim: true, required: true}]

    },
    { timestamps: true }
)
module.exports = mongoose.model('Song', songSchema)
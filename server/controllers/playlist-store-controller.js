const Playlist = require('../schemas/playlist-model')
const User = require('../schemas/user-model')
const auth = require('../auth')

createPlaylist = async (req, res) => {
    // if invalid user is given in request.
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }


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
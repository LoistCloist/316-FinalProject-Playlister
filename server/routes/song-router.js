const express = require('express')
const SongController = require('../controllers/song-store-controller')
const router = express.Router()
const auth = require('../auth')

router.post('/songs', auth.verify, SongController.createSong)
router.get('/songs', SongController.getTargetSongs) // Public - guests can view songs
router.get('/songs/playlist/:playlistId', SongController.getAllSongsInPlaylist) // Public - guests can view playlist songs
router.get('/songs/:id', SongController.getSongById) // Public - guests can view song
router.put('/songs/:id', auth.verify, SongController.editSongById)
router.get('/userSongs/:id', auth.verify, SongController.getUserSongs) // Requires auth - user's own songs
router.delete('/songs/:id', auth.verify, SongController.deleteSongById)

module.exports = router
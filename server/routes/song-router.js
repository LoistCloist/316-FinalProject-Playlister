const express = require('express')
const SongController = require('../controllers/song-store-controller')
const router = express.Router()
const auth = require('../auth')

router.post('/songs', auth.verify, SongController.createSong)
router.get('/songs', auth.verify, SongController.getTargetSong)
router.get('/songs/:id', auth.verify, SongController.getSongById)
router.put('/songs/:id', auth.verify, SongController.editSongById)
router.get('/songs/:playlistId', auth.verify, SongController.getAllSongsInPlaylist)
route.get('/userSongs/:id', auth.verify, SongController.getUserSongs)
route.delete('/songs/:id', auth.verify, SongController.deleteSongById)

module.exports = router
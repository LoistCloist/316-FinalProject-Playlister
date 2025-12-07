import axios from 'axios'
axios.defaults.withCredentials = true;
const api = axios.create({
    baseURL: 'http://localhost:4000/store',
})

export const createSong = ( title, artist, year, youtubeId, ownerEmail ) => {
    return api.post('/songs/', {
        title: title,
        artist: artist,
        year: year,
        youtubeId: youtubeId,
        ownerEmail: ownerEmail
    })
}
export const getTargetSongs = (id) => {
    return api.get(`/songs/${id}`);
}
export const getSongById = (id) => {
    return api.get(`/songs/${id}`);
}
export const editSongById = ( songId, title, artist, year, youtubeId ) => {
    return api.put(`/songs/${songId}`, {
        title: title,
        artist: artist,
        year: year,
        youtubeId: youtubeId
    })
}   
export const getAllSongsInPlaylist = (userid) => {
    return api.get(`userplaylist/${userid}`)
}
export const getUserSongs = (userId) => {
    return api.get(`/userSongs/${userId}`)
}
export const deleteSongById = (id) => {
    return api.delete(`/playlist/${id}`)
}

const apis = {
    createSong,
    getTargetSongs,
    getSongById,
    editSongById,
    getAllSongsInPlaylist,
    getUserSongs,
    deleteSongById
}

export default apis
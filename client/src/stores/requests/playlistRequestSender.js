import axios from 'axios'
axios.defaults.withCredentials = true;
const api = axios.create({
    baseURL: 'http://localhost:4000/store',
    withCredentials: true
})

export const createPlaylist = (playlistName, userName, email, songs) => {
    return api.post('/playlist/', {
        playlistName: playlistName,
        userName: userName,
        email: email,
        songs: songs,
    })
}
export const deletePlaylistById = (id) => {
    return api.delete(`/playlist/${id}`);
}
export const getPlaylists = (playlistName, userName, title, artist, year) => {
    return api.post('/playlist/search', {
        playlistName: playlistName || undefined,
        userName: userName || undefined,
        title: title || undefined,
        artist: artist || undefined,
        year: year || undefined
    });
}
export const getPlaylistById = (id) => {
    return api.get(`/playlist/${id}`)
}   
export const getUserPlaylists = (userid) => {
    // Add timestamp to bust any potential caching
    const timestamp = new Date().getTime();
    return api.get(`userplaylist/${userid}?t=${timestamp}`)
}
export const getAllPlaylists = () => {
    return api.get('/allplaylists')
}
export const updatePlaylist = (id, playlistName, userName, email, songs) => {
    return api.put(`/playlist/${id}`, {
        playlistName: playlistName,
        userName: userName,
        email: email,
        songs: songs,
    })
}

const apis = {
    createPlaylist,
    deletePlaylistById,
    getPlaylists,
    getPlaylistById,
    getUserPlaylists,
    getAllPlaylists,
    updatePlaylist
}

export default apis;
import { createContext, useContext, useState, useEffect } from 'react'
import { jsTPS } from "jstps"
import AuthContext from '../auth'
import songRequestSender from './requests/songRequestSender'
import DuplicateSongInPlaylist_Transaction from '../transactions/DuplicateSongInPlaylist_Transaction'
import RemoveSongFromPlaylist_Transaction from '../transactions/RemoveSongFromPlaylist_Transaction'

const SongStoreContext = createContext({});
console.log("created SongStoreContext");

const SongStoreActionType = {
    HIDE_MODALS: "HIDE_MODALS",
    SORT_SONGS: "SORT_SONGS",
    ADD_SONG_TO_CATALOG: "ADD_SONG_TO_CATALOG",
    GET_ALL_PLAYLISTS: "GET_ALL_PLAYLISTS",
    GET_USER_SONGS: "GET_USER_SONGS",
    EDIT_SONG: "EDIT_SONG",
    MARK_SONG_FOR_DELETION: "MARK_SONG_FOR_DELETION",
    UPDATE_SONG_IN_LIST: "UPDATE_SONG_IN_LIST",
}

const tps = new jsTPS();

const CurrentModal = {
    NONE: "NONE",
    EDIT_SONG_MODAL: "EDIT_SONG_MODAL",
    REMOVE_SONG_MODAL: "REMOVE_SONG_MODAL",
    ADD_SONG_TO_CATALOG_MODAL: "ADD_SONG_TO_CATALOG_MODAL",
    VERIFY_REMOVE_SONG_MODAL: "VERIFY_REMOVE_SONG_MODAL",
}

function SongStoreContextProvider(props) {
    const [ songStore, setSongStore ] = useState({
        currentModal: CurrentModal.NONE,
        currentSong: null,
        newSongCounter: 0,
        songs: [],
        songMarkedForDeletion: null,
        songsRefreshTrigger: 0
    })

    const { auth } = useContext(AuthContext);

    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case SongStoreActionType.ADD_SONG_TO_CATALOG: {
                return setSongStore({
                    ...songStore,
                    currentModal: CurrentModal.ADD_SONG_TO_CATALOG_MODAL,
                    currentSong: payload.currentSong,
                    newSongCounter: songStore.newSongCounter + 1,
                })
            }
            case SongStoreActionType.SORT_SONGS: {
                return setSongStore({
                    ...songStore,
                    currentSong: null,
                    newSongCounter: songStore.newSongCounter,
                    songs: payload.songs ? [...payload.songs] : []
                })
            }
            case SongStoreActionType.GET_ALL_PLAYLISTS: {
                return setSongStore({
                    ...songStore,
                    playlists: payload.playlists,
                })
            }
            case SongStoreActionType.GET_USER_SONGS: {
                return setSongStore({
                    ...songStore,
                    songs: payload.songs ? [...payload.songs] : [],
                    // Ensure modal state is cleared when loading songs
                    currentModal: CurrentModal.NONE,
                    currentSong: null,
                    songMarkedForDeletion: null
                })
            }
            case SongStoreActionType.HIDE_MODALS: {
                return setSongStore({
                    ...songStore,
                    currentModal: CurrentModal.NONE,
                    currentSong: null,
                    songMarkedForDeletion: null,
                })
            }
            case SongStoreActionType.EDIT_SONG: {
                return setSongStore({
                    ...songStore,
                    currentModal: CurrentModal.EDIT_SONG_MODAL,
                    currentSong: payload.song,
                })
            }
            case SongStoreActionType.MARK_SONG_FOR_DELETION: {
                return setSongStore({
                    ...songStore,
                    currentModal: CurrentModal.VERIFY_REMOVE_SONG_MODAL,
                    currentSong: payload.song,
                    songMarkedForDeletion: payload.song,
                })
            }
            case SongStoreActionType.UPDATE_SONG_IN_LIST: {
                const updatedSongs = songStore.songs.map(song => 
                    song.songId === payload.song.songId ? payload.song : song
                );
                return setSongStore({
                    ...songStore,
                    songs: updatedSongs
                })
            }
            default:
                return songStore;
            }
    }

    // Create methods separately (without mutating state)
    const addSongToCatalog = function(id, newName) {
        storeReducer({
            type: SongStoreActionType.ADD_SONG_TO_CATALOG,
            payload: { currentSong: { id, name: newName } }
        });
    }

    const hideModals = function() {
        storeReducer({
            type: SongStoreActionType.HIDE_MODALS,
            payload: {}
        });
    }

    const openEditSongModal = function(song) {
        storeReducer({
            type: SongStoreActionType.EDIT_SONG,
            payload: { song: song }
        });
    }

    const sortSongs = function(sortBy, sortOrder) {
        const sortedSongs = [...songStore.songs].sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            // Handle string comparison
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            // Compare values
            let comparison = 0;
            if (aValue > bValue) {
                comparison = 1;
            } else if (aValue < bValue) {
                comparison = -1;
            }
            
            // Reverse for descending order
            return sortOrder === 'asc' ? comparison : -comparison;
        });
        storeReducer({
            type: SongStoreActionType.SORT_SONGS,
            payload: { songs: sortedSongs }
        });
    }

    const undo = function() {
        tps.undoTransaction();
    }

    const redo = function() {
        tps.doTransaction();
    }

    const canAddNewSong = function() {
        return songStore.currentListSongs !== null;
    }

    const loadUserSongs = async function() {
        if (auth.loggedIn && auth.user && auth.user.userId) {
            try {
                const response = await songRequestSender.getUserSongs(auth.user.userId);
                if (response.status === 200 && response.data.success) {
                    storeReducer({
                        type: SongStoreActionType.GET_USER_SONGS,
                        payload: { songs: response.data.songs }
                    });
                    // Increment refresh trigger to notify components
                    setSongStore(prevStore => ({
                        ...prevStore,
                        songsRefreshTrigger: prevStore.songsRefreshTrigger + 1
                    }));
                }
            } catch (error) {
                console.error("Failed to load user songs:", error);
            }
        }
    }

    const searchSongs = async function(title, artist, year) {
        try {
            // If all fields are empty and user is logged in, load user's songs
            // For guests, require at least one search field
            if (!title && !artist && !year) {
                if (auth.loggedIn && auth.user?.userId) {
                    await loadUserSongs();
                } else {
                    // Guest users must provide search criteria
                    storeReducer({
                        type: SongStoreActionType.GET_USER_SONGS,
                        payload: { songs: [] }
                    });
                }
                return;
            }
            
            const response = await songRequestSender.getTargetSongs(
                title || undefined,
                artist || undefined,
                year || undefined
            );
            if (response.status === 200 && response.data.success) {
                // Replace songs array with search results
                storeReducer({
                    type: SongStoreActionType.GET_USER_SONGS,
                    payload: { songs: response.data.songs || [] }
                });
            } else {
                // No results found
                storeReducer({
                    type: SongStoreActionType.GET_USER_SONGS,
                    payload: { songs: [] }
                });
            }
        } catch (error) {
            console.error("Failed to search songs:", error);
            if (error.response?.status === 404) {
                // No results found
                storeReducer({
                    type: SongStoreActionType.GET_USER_SONGS,
                    payload: { songs: [] }
                });
            } else {
                alert('Error searching songs');
            }
        }
    }

    const markSongForDeletion = function(song) {
        storeReducer({
            type: SongStoreActionType.MARK_SONG_FOR_DELETION,
            payload: { song: song }
        });
    }

    const deleteSong = async function(song) {
        if (!song || !song.songId) {
            console.error('Cannot delete song: invalid song data');
            return;
        }
        try {
            const response = await songRequestSender.deleteSongById(song.songId);
            if (response.status === 200 && response.data.success) {
                // Hide modal first for immediate feedback
                storeReducer({
                    type: SongStoreActionType.HIDE_MODALS,
                    payload: {}
                });
                // Reload songs after successful deletion with a small delay
                await new Promise(resolve => setTimeout(resolve, 100));
                await loadUserSongs();
                // Additional delay to ensure state is fully updated
                await new Promise(resolve => setTimeout(resolve, 50));
            } else {
                console.error('Failed to delete song:', response.data);
                alert('Failed to delete song');
            }
        } catch (error) {
            console.error('Error deleting song:', error);
            // Hide modal even on error
            storeReducer({
                type: SongStoreActionType.HIDE_MODALS,
                payload: {}
            });
            if (error.response?.status === 400 && error.response?.data?.errorMessage?.includes('authorization')) {
                alert('You can only delete songs that you created');
            } else {
                alert('Error deleting song');
            }
        }
    }

    // Fetch user songs on startup when user is logged in
    useEffect(() => {
        if (auth.loggedIn && auth.user?.userId) {
            loadUserSongs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.loggedIn, auth.user?.userId]);

    const updateSongsArray = function(songs) {
        storeReducer({
            type: SongStoreActionType.GET_USER_SONGS,
            payload: { songs: songs }
        });
    }

    const editSong = async function(songId, title, artist, year, youtubeId) {
        if (!songId) {
            console.error('Cannot update song: songId is required');
            return false;
        }

        // Validate required fields
        if (!title.trim() || !artist.trim() || !year.trim() || !youtubeId.trim()) {
            alert('All fields are required');
            return false;
        }

        try {
            // Make API call to persist the change
            const response = await songRequestSender.editSongById(
                songId,
                title.trim(),
                artist.trim(),
                year.trim(),
                youtubeId.trim()
            );
            
            if (response.status === 200 && response.data.success) {
                // Find and update the song in the list
                const updatedSong = songStore.songs.find(song => song.songId === songId);
                if (updatedSong) {
                    const newSong = {
                        ...updatedSong,
                        title: title.trim(),
                        artist: artist.trim(),
                        year: year.trim(),
                        youtubeId: youtubeId.trim()
                    };
                    storeReducer({
                        type: SongStoreActionType.UPDATE_SONG_IN_LIST,
                        payload: { song: newSong }
                    });
                }
                return true;
            } else {
                console.error('Failed to update song:', response.data);
                alert('Failed to update song');
                return false;
            }
        } catch (error) {
            console.error('Error updating song:', error);
            alert('Error updating song');
            return false;
        }
    }

    const addDuplicateSongInPlaylistTransaction = function(songId) {
        let transaction = new DuplicateSongInPlaylist_Transaction(this, songId);
        tps.addTransaction(transaction);
    }
    const addRemoveSongFromPlaylistTransaction = function(song) {
        let transaction = new RemoveSongFromPlaylist_Transaction(this, song);
        tps.addTransaction(transaction);
    }

    // Combine state and methods without mutating the state object
    const songStoreWithMethods = {
        ...songStore,
        addSongToCatalog,
        hideModals,
        openEditSongModal,
        editSong,
        updateSongsArray,
        sortSongs,
        undo,
        redo,
        canAddNewSong,
        loadUserSongs,
        searchSongs,
        markSongForDeletion,
        deleteSong,
        addDuplicateSongInPlaylistTransaction,
        addRemoveSongFromPlaylistTransaction
    };

    return (
        <SongStoreContext.Provider value={{
            songStore: songStoreWithMethods
        }}>
            {props.children}
        </SongStoreContext.Provider>
    )
}

export default SongStoreContext;
export { SongStoreContextProvider };


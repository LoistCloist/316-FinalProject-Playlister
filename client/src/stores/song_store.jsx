import { createContext, useContext, useState, useEffect } from 'react'
import { jsTPS } from "jstps"
import UpdateSong_Transaction from '../transactions/EditSong_Transaction'
import DuplicateSong_Transaction from '../transactions/DuplicateSong_Transaction'
import AuthContext from '../auth'
import songRequestSender from './requests/songRequestSender'

const SongStoreContext = createContext({});
console.log("created SongStoreContext");

const SongStoreActionType = {
    HIDE_MODALS: "HIDE_MODALS",
    SORT_SONGS: "SORT_SONGS",
    ADD_SONG_TO_CATALOG: "ADD_SONG_TO_CATALOG",
    GET_ALL_PLAYLISTS: "GET_ALL_PLAYLISTS",
    GET_USER_SONGS: "GET_USER_SONGS",
    EDIT_SONG: "EDIT_SONG",
}

const tps = new jsTPS();

const CurrentModal = {
    NONE: "NONE",
    EDIT_SONG_MODAL: "EDIT_SONG_MODAL",
    REMOVE_SONG_MODAL: "REMOVE_SONG_MODAL",
    ADD_SONG_MODAL: "ADD_SONG_MODAL",
    VERIFY_REMOVE_SONG_MODAL: "VERIFY_REMOVE_SONG_MODAL",
}

function SongStoreContextProvider(props) {
    const [ songStore, setSongStore ] = useState({
        currentModal: CurrentModal.NONE,
        currentSong: null,
        newSongCounter: 0,
        songs: []
    })

    const { auth } = useContext(AuthContext);

    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case SongStoreActionType.ADD_SONG_TO_CATALOG: {
                return setSongStore({
                    ...songStore,
                    currentModal: CurrentModal.ADD_SONG_MODAL,
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
                    songs: payload.songs ? [...payload.songs] : []
                })
            }
            case SongStoreActionType.HIDE_MODALS: {
                return setSongStore({
                    ...songStore,
                    currentModal: CurrentModal.NONE,
                    currentSong: null,
                })
            }
            case SongStoreActionType.EDIT_SONG: {
                return setSongStore({
                    ...songStore,
                    currentModal: CurrentModal.EDIT_SONG_MODAL,
                    currentSong: payload.song,
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

    const editSong = function(song) {
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
                }
            } catch (error) {
                console.error("Failed to load user songs:", error);
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

    // Combine state and methods without mutating the state object
    const songStoreWithMethods = {
        ...songStore,
        addSongToCatalog,
        hideModals,
        editSong,
        sortSongs,
        undo,
        redo,
        canAddNewSong,
        loadUserSongs
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


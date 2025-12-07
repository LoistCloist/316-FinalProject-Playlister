import { createContext, useContext, useState } from 'react'
import { jsTPS } from "jstps"
import AuthContext from '../auth'

const PlaylistStoreContext = createContext({});
console.log("created PlaylistStoreContext");

const PlaylistStoreActionType = {
    CREATE_NEW_LIST: "CREATE_NEW_LIST",
    MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    EDIT_PLAYLIST: "EDIT_PLAYLIST",
    HIDE_MODALS: "HIDE_MODALS",
    SORT_PLAYLISTS: "SORT_PLAYLISTS",
    DUPLICATE_PLAYLIST: "DUPLICATE_PLAYLIST",
    DELETE_PLAYLIST: "DELETE_PLAYLIST",
    PLAY_PLAYLIST: "PLAY_PLAYLIST",
    FIND_PLAYLIST: "FIND_PLAYLIST",
    FIND_PLAYLIST_BY_ID: "FIND_PLAYLIST_BY_ID",
    GET_ALL_PLAYLISTS: "GET_ALL_PLAYLISTS",
}

const tps = new jsTPS();

const CurrentModal = {
    NONE: "NONE",
    VERIFY_DELETE_LIST: "VERIFY_DELETE_LIST",
    VERIFY_REMOVE_sONG_MODAL: "VERIFY_REMOVE_SONG_MODAL",
    PLAY_PLAYLIST_MODAL: "PLAY_PLAYLIST_MODAL",
    EDIT_SONG_MODAL: "EDIT_SONG_MODAL",
    SELECT_AVATAR_IMAGE_MODAL: "SELECT_AVATAR_IMAGE_MODAL",
    EDIT_PLAYLIST_MODAL: "EDIT_PLAYLIST_MODAL",
    DUPLICATE_PLAYLIST_MODAL: "DUPLICATE_PLAYLIST_MODAL"
}

function PlaylistStoreContextProvider(props) {
    const [ playlistStore, setPlaylistStore ] = useState({
        currentModal: CurrentModal.NONE,
        playlists: [],
        currentList: null,
        newListCounter: 0,
        listMarkedForDeletion: null
    })
    console.log("inside usePlaylistStore")

    const { auth } = useContext(AuthContext);
    console.log("auth: " + auth);

    const playlistStoreReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case PlaylistStoreActionType.CREATE_NEW_LIST: {
                return setPlaylistStore({
                    currentModal: CurrentModal.NONE,
                    playlists: playlistStore.playlists,
                    currentList: null,
                    newListCounter: playlistStore.newListCounter + 1,
                    listMarkedForDeletion: null
                })
            }
            case PlaylistStoreActionType.MARK_LIST_FOR_DELETION: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.VERIFY_DELETE_LIST,
                    listMarkedForDeletion: payload.list
                })
            }
            case PlaylistStoreActionType.SET_CURRENT_LIST: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentList: payload.list
                })
            }
            case PlaylistStoreActionType.EDIT_PLAYLIST: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.EDIT_PLAYLIST_MODAL,
                    currentList: payload.list
                })
            }
            case PlaylistStoreActionType.HIDE_MODALS: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.NONE,
                    currentList: null
                })
            }
            case PlaylistStoreActionType.SORT_PLAYLISTS: {
                return setPlaylistStore({
                    ...playlistStore,
                    playlists: payload.playlists
                })
            }
            case PlaylistStoreActionType.DUPLICATE_PLAYLIST: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.DUPLICATE_PLAYLIST_MODAL,
                    currentList: payload.list
                })
            }
            case PlaylistStoreActionType.DELETE_PLAYLIST: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.VERIFY_DELETE_LIST,
                    listMarkedForDeletion: payload.list
                })
            }
            case PlaylistStoreActionType.PLAY_PLAYLIST: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.PLAY_PLAYLIST_MODAL,
                    currentList: payload.list
                })
            }
            case PlaylistStoreActionType.FIND_PLAYLIST: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.NONE,
                    playlists: payload.playlists,
                    currentList: null
                })
            }
            case PlaylistStoreActionType.FIND_PLAYLIST_BY_ID: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.NONE,
                    currentList: payload.list
                })
            }
            case PlaylistStoreActionType.GET_ALL_PLAYLISTS: {
                return setPlaylistStore({
                    ...playlistStore,
                    currentModal: CurrentModal.NONE,
                    playlists: payload.playlists
                })
            }
            default:
                return playlistStore;
        }
    }
    const createNewList = function() {
        playlistStoreReducer({
            type: PlaylistStoreActionType.CREATE_NEW_LIST,
            payload: {}
        });
    }
    const markListForDeletion = function(list) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.MARK_LIST_FOR_DELETION,
            payload: { list: list }
        });
    }

    const setCurrentList = function(list) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.SET_CURRENT_LIST,
            payload: { list: list }
        });
    }

    const editPlaylist = function(list) {
        
        playlistStoreReducer({
            type: PlaylistStoreActionType.EDIT_PLAYLIST,
            payload: { list: list }
        });
    }

    const hideModals = function() {
        playlistStoreReducer({
            type: PlaylistStoreActionType.HIDE_MODALS,
            payload: {}
        });
    }

    const sortPlaylists = function(playlists) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.SORT_PLAYLISTS,
            payload: { playlists: playlists }
        });
    }

    const duplicatePlaylist = function(list) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.DUPLICATE_PLAYLIST,
            payload: { list: list }
        });
    }

    const deletePlaylist = function(list) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.DELETE_PLAYLIST,
            payload: { list: list }
        });
    }

    const playPlaylist = function(list) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.PLAY_PLAYLIST,
            payload: { list: list }
        });
    }

    const findPlaylist = function(playlists) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.FIND_PLAYLIST,
            payload: { playlists: playlists }
        });
    }

    const findPlaylistById = function(list) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.FIND_PLAYLIST_BY_ID,
            payload: { list: list }
        });
    }

    const getAllPlaylists = function(playlists) {
        playlistStoreReducer({
            type: PlaylistStoreActionType.GET_ALL_PLAYLISTS,
            payload: { playlists: playlists }
        });
    }

    const undo = function() {
        tps.undoTransaction();
    }

    const redo = function() {
        tps.doTransaction();
    }

    // Combine state and methods without mutating the state object
    const playlistStoreWithMethods = {
        ...playlistStore,
        createNewList,
        markListForDeletion,
        setCurrentList,
        editPlaylist,
        hideModals,
        sortPlaylists,
        duplicatePlaylist,
        deletePlaylist,
        playPlaylist,
        findPlaylist,
        findPlaylistById,
        getAllPlaylists,
        undo,
        redo
    };

    return (
        <PlaylistStoreContext.Provider value={{
            playlistStore: playlistStoreWithMethods
        }}>
            {props.children}
        </PlaylistStoreContext.Provider>
    )
}

export default PlaylistStoreContext;
export { PlaylistStoreContextProvider };


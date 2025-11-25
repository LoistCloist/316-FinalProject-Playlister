import { createContext, useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { jsTPS } from "jstps"
import playlistRequestSender from './requests/playlistRequestSender'
import songRequestSender from './requests/songRequestSender'
import RemoveSongFromPlaylist_Transaction from '../transactions/RemoveSongFromPlaylist_Transaction'
import AuthContext from '../auth'

export const PlaylistStoreContext = createContext({});
console.log("created PlaylistStoreContext");

export const PlaylistStoreActionType = {
    CREATE_NEW_LIST: "CREATE_NEW_LIST",
    MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    EDIT_PLAYLIST: "EDIT_PLAYLIST",
    EDIT_SONG: "EDIT_SONG",
    REMOVE_SONG_FROM_CATALOG: "REMOVE_SONG_FROM_CATALOG",
    HIDE_MODALS: "HIDE_MODALS",
    SORT_PLAYLISTS: "SORT_PLAYLISTS",
    SORT_SONGS: "SORT_SONGS",
    DUPLICATE_PLAYLIST: "DUPLICATE_PLAYLIST",
    DELETE_PLAYLIST: "DELETE_PLAYLIST",
    PLAY_PLAYLIST: "PLAY_PLAYLIST",
    FIND_PLAYLIST: "FIND_PLAYLIST",
    FIND_PLAYLIST_BY_ID: "FIND_PLAYLIST_BY_ID",
    ADD_SONG_TO_CATALOG: "ADD_SONG_TO_CATALOG",
    GET_ALL_PLAYLISTS: "GET_ALL_PLAYLISTS",
    GET_USER_SONGS: "GET_USER_SONGS"
}

const tps = new jsTPS();

const CurrentModal = {
    NONE: "NONE",
    VERIFY_DELETE_LIST: "VERIFY_DELETE_LIST",
    VERIFY_REMOVE_sONG_MODAL: "VERIFY_REMOVE_SONG_MODAL",
    PLAY_PLAYLIST_MODAL: "PLAY_PLAYLIST_MODAL",
    EDIT_SONG_MODAL: "EDIT_SONG_MODAL",
    SELECT_AVATAR_IMAGE_MODAL: "SELECT_AVATAR_IMAGE_MODAL",
    EDIT_PLAYLIST_MODAL: "EDIT_PLAYLIST_MODAL"
}
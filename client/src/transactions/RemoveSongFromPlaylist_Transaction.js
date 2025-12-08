import { jsTPS_Transaction } from "jstps"

export default class RemoveSongFromPlaylist_Transaction extends jsTPS_Transaction {
    constructor(initStore, initSong) {
        super();
        this.store = initStore;
        this.song = initSong;
    }

    executeDo() {
        this.store.removeSongFromPlaylist(this.song.songId);
    }
    
    executeUndo() {
        this.store.addSongToPlaylist(this.song);
    }

}
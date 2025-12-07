import { jsTPS_Transaction } from "jstps"

export default class RemoveSongFromPlaylist_Transaction extends jsTPS_Transaction {
    constructor(initStore, initSongId) {
        super();
        this.store = initStore;
        this.songId = initSongId;
    }

    executeDo() {
        this.store.removeSongFromPlaylist(this.songId);
    }
    
    executeUndo() {
        this.store.addSongToPlaylist(this.songId);
    }

}
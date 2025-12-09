import { jsTPS_Transaction } from "jstps"

export default class RemoveSongFromPlaylist_Transaction extends jsTPS_Transaction {
    constructor(initStore, initSongId) {
        super();
        this.store = initStore;
        this.song = initSongId;
    }

    async executeDo() {
        await this.store.removeSongFromPlaylist(this.song.songId);
    }
    
    async executeUndo() {
        await this.store.addSongToPlaylist(this.song.songId);
    }

}
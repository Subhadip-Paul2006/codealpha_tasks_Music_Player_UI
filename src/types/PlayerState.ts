export type ActiveView = 'library' | 'album' | 'nowplaying' | 'playlist' | 'componentsheet' | 'newplaylist' | 'artist' | 'liked' | 'search' | string;

export interface PlayerState {
    currentSongId: number | null;
    isPlaying: boolean;
    volume: number;        // 0-1
    progress: number;      // 0-1
    activeView: ActiveView;
    isLoading: boolean;
    error: string | null;
    likedSongIds: number[];
}

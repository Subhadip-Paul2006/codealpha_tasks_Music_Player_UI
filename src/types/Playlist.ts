export interface Playlist {
    id: string;
    name: string;
    cover?: string;
    songIds: number[];
    createdAt: number;
}

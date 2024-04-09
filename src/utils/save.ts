import {SaveState} from "../components/Table";

export const getExportString = (data: SaveState): string => {
    return btoa(JSON.stringify(data));
};

export const getImportData = (data: string): SaveState => {
    return JSON.parse(atob(data));
};
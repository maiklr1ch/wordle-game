import {getExportString, getGoodSave} from "../utils/save";
import React from "react";
import {SaveState} from "./Table";

type Props = {
    isDebug: boolean,
    correctWord: string,
    save: SaveState
}

export const Debug = ({ isDebug, correctWord, save }: Props) => {
    return (
        <>
            <h3 hidden={!isDebug}>{correctWord}</h3>
            <pre hidden={!isDebug}>
                        ========= DEBUG ========<br/>
                        Correct: {correctWord}<br/>
                        Good save: {getGoodSave()}<br/>
                        This save: {getExportString(save)}
                    </pre>
        </>
    );
};
import React from "react";
import {Board, PointerState} from "./Table";

type Props = {
    board: Board,
    pointer: PointerState,
    onPressed: (row: number, col: number) => void
}

export const MainBoard = ({ board, pointer, onPressed }: Props) => {
    return (
        <table>
            <tbody>
            {board.map((row, rowIndex) =>
                <tr key={rowIndex}>
                    {row.map((cell, cellIndex) =>
                        <td
                            className={`${cell.state} ${rowIndex === pointer.row && cellIndex === pointer.col && 'pointer'}`}
                            key={cellIndex}
                            onClick={() => onPressed(rowIndex, cellIndex)}
                        >
                            {cell.letter}
                        </td>
                    )}
                </tr>
            )}
            </tbody>
        </table>
    );
};
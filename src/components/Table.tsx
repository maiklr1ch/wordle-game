import React, {useState} from "react";
import {Keyboard} from "./Keyboard";
import {range} from "../utils/array";

const WORD_LENGTH = 5;
const ROW_COUNT = 6;

type CellState = {
    letter: string,
    state?: 'correct' | 'semi-correct' | 'incorrect',
}

type Board = CellState[][];

const deepCopyBoard = (board: Board): Board => JSON.parse(JSON.stringify(board));

const getEmptyCell = (): CellState => ({
    letter: ""
});

const getEmptyBoard = (): Board =>
    range(ROW_COUNT).map(() =>
        range(WORD_LENGTH).map(() => getEmptyCell())
    );

export const Table = () => {
    const [board, setBoard] = useState<Board>(getEmptyBoard());
    const [currentRow, setCurrentRow] = useState<number>(0);
    const handleBackspace = () => {
        setBoard((prevState) => {
           const nextState = deepCopyBoard(prevState);
           const row = nextState[currentRow];
           for(let i = 0; i < WORD_LENGTH; i++)
           {
               if(row[i].letter === '' && i > 0) {
                   row[i-1].letter = '';
                   break;
               }

               if(i + 1 === WORD_LENGTH) {
                   row[i].letter = '';
                   break;
               }
           }
           return nextState;
        });
    }

    const handlePressed = (button: string) => {
        setBoard((prevState) => {
            const nextState: Board = deepCopyBoard(prevState);
            for (const cell of nextState[currentRow]) {
                if(!cell.letter)
                {
                    cell.letter = button;
                    break;
                }
            }
            return nextState;
        });
    };

    return (
        <div>
            <div className="wrapper">
                <table>
                    <tbody>
                    {board.map(row =>
                        <tr>
                            {row.map(value =>
                                <td className={value.state}>
                                    {value.letter}
                                </td>
                            )}
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
            <Keyboard onBackspace={handleBackspace} onPressed={handlePressed} />
        </div>
    );
};

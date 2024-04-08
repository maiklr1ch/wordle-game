import React, {useEffect, useMemo, useState} from "react";
import {Keyboard} from "./Keyboard";
import {range} from "../utils/array";
import {getRandomWord, isProper} from "../utils/dictionary";
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const WORD_LENGTH = 5;
const ROW_COUNT = 6;

export type LetterState = 'correct' | 'semi-correct' | 'incorrect';

type CellState = {
    letter: string,
    state?: LetterState
}

type Board = CellState[][];

export type PointerState = {
    row: number,
    col: number
};

const deepCopyBoard = (board: Board): Board => JSON.parse(JSON.stringify(board));

const getEmptyCell = (): CellState => ({
    letter: ""
});

const getEmptyBoard = (): Board =>
    range(ROW_COUNT).map(() =>
        range(WORD_LENGTH).map(() => getEmptyCell())
    );

const getStartPointer = (): PointerState => ({
    row: 0,
    col: 0
});

export const Table = () => {
    const [board, setBoard] = useState<Board>(getEmptyBoard());
    const [pointer, setPointer] = useState<PointerState>(getStartPointer());
    const [correctWord, setCorrectWord] = useState<string>(getRandomWord());
    const [isWin, setIsWin] = useState<boolean>(false);

    useEffect(() => {
        if(isWin)
            return;
        const handleKeydown = (ev: KeyboardEvent) => {
            const key = ev.key.toLowerCase();
            if(key === "backspace")
                handleBackspace(pointer);
            if(key === "enter")
                handleEnter(pointer);
            if('a' <= key && 'z' >= key && key.length === 1)
                handlePressed(key, pointer);
            if(key === "arrowleft")
                setPointer((prevState: PointerState) => {
                    return { row: prevState.row, col: prevState.col ? prevState.col - 1 : 0 };
                });
            if(key === "arrowright")
                setPointer((prevState: PointerState) => {
                    return { row: prevState.row, col: prevState.col + 1 === WORD_LENGTH ? prevState.col : prevState.col + 1 };
                });
        };

        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown);
    }, [pointer, isWin]);

    useEffect(() => {
        if(isWin)
        {
            const startNewGame = () => {
                clearTimeout(timer);
                setBoard(getEmptyBoard());
                setPointer(getStartPointer());
                setCorrectWord(getRandomWord());
                setIsWin(false);
            };
            toast.success(`You win! The correct word was: ${correctWord.toUpperCase()}\nNew game starts in 10s`, { theme: "dark", autoClose: 10000, onClose: startNewGame, onClick: startNewGame });
            const timer = setTimeout(startNewGame, 10000);
        }
    }, [isWin]);

    const currentWord = useMemo(() => {
        return board[pointer.row]
            .map((cell) => cell.letter)
            .join('')
    }, [board, pointer]);

    const handleBackspace = (pointer: PointerState) => {
        setBoard((prevState) => {
           const nextState = deepCopyBoard(prevState);
           nextState[pointer.row][pointer.col].letter = "";
           return nextState;
        });
        setPointer((prevState: PointerState) => {
            return { row: prevState.row, col: prevState.col ? prevState.col - 1 : 0 };
        });
    }

    const handlePressed = (button: string, pointer: PointerState) => {
        setBoard((prevState) => {
            const nextState: Board = deepCopyBoard(prevState);
            nextState[pointer.row][pointer.col].letter = button;
            return nextState;
        });
        setPointer((prevState: PointerState) => {
            return { row: prevState.row, col: prevState.col + 1 === WORD_LENGTH ? prevState.col : prevState.col + 1 };
        });
    };

    const handleEnter = (pointer: PointerState) => {
        if (currentWord.length === WORD_LENGTH)
        {
            if (currentWord === correctWord)
            {
                setBoard((prevState: Board) => {
                    const nextState = deepCopyBoard(prevState);
                    nextState[pointer.row].forEach((cell) => {
                        cell.state = 'correct';
                    });
                    return nextState;
                });
                setIsWin(true);
            }
            else if(isProper(currentWord))
            {
                setBoard((prevState: Board) => {
                    const nextState = deepCopyBoard(prevState);
                    nextState[pointer.row].forEach((cell, index) => {
                        if (cell.letter === correctWord[index])
                            cell.state = 'correct';
                        else if (correctWord.includes(cell.letter))
                            cell.state = 'semi-correct';
                        else
                            cell.state = 'incorrect';
                    });
                    return nextState;
                });
                setPointer((prevState: PointerState) => {
                    return { row: prevState.row + 1, col: 0 };
                });
            }
            else
                toast.error(`The word is not proper! Try: ${['PEACE', 'OCEAN'][Math.floor(Math.random() * 2)]}`, { theme: "dark" });
        }
        else
            toast.error("Not enough letters!", { theme: "dark" });
    }

    const handleNewGame = () => {
        toast.info('New game started', { theme: 'dark' });
        setBoard(getEmptyBoard());
        setPointer(getStartPointer());
        setCorrectWord(getRandomWord());
        setIsWin(false);
    };

    const letterStates = useMemo<{ [letter: string]: LetterState }>(() => {
        return board.flat().reduce<{ [key: string]: LetterState }>((prev, cur) => {
            const newLetterState: LetterState | undefined = prev[cur.letter] === 'correct' ? 'correct' : cur.state;
            if(newLetterState)
                return {
                    ...prev,
                    [cur.letter]: newLetterState
                }
            else
                return prev;
        }, {});
    }, [board]);

    return (
        <div>
            Correct word is {correctWord}
            <div className="wrapper">
                <table>
                    <tbody>
                    {board.map((row, rowIndex) =>
                        <tr>
                            {row.map((cell, cellIndex) =>
                                <td className={`${cell.state} ${rowIndex === pointer.row && cellIndex === pointer.col && 'pointer'}`}>
                                    {cell.letter}
                                </td>
                            )}
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
            <Keyboard onBackspace={handleBackspace} onPressed={handlePressed} onEnter={handleEnter} onNewGame={handleNewGame} pointer={pointer} letterStates={letterStates} />
            <ToastContainer
                position="top-center"
                autoClose={1000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover={false}
                theme="dark"
            />
        </div>
    );
};

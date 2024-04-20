import React, {useEffect, useMemo, useRef, useState} from "react";
import {Keyboard} from "./Keyboard";
import {range} from "../utils/array";
import {getRandomWord, isProper} from "../utils/dictionary";
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {MainBoard} from "./MainBoard";
import {Stats} from "./Stats";
import {getMaxLevelExp} from "../utils/level";
import {getExportString, getImportData} from "../utils/save";
import {Debug} from "./Debug";

const WORD_LENGTH = 5;
const ROW_COUNT = 6;

export type LetterState = 'correct' | 'semi-correct' | 'incorrect';

type CellState = {
    letter: string,
    state?: LetterState
}

export type Board = CellState[][];

export type PointerState = {
    row: number,
    col: number
};

export type StatsState = {
    level: number,
    exp: number,
    correct: number,
    wrong: number
};

export type SaveState = {
    board: Board,
    pointer: PointerState,
    correctWord: string,
    isWin: boolean,
    isLose: boolean,
    stats: StatsState
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

const getEmptyStats = (): StatsState => ({
    level: 1,
    exp: 0,
    correct: 0,
    wrong: 0,
});

export const Table = () => {
    const [board, setBoard] = useState<Board>(getEmptyBoard());
    const [pointer, setPointer] = useState<PointerState>(getStartPointer());
    const [stats, setStats] = useState<StatsState>(getEmptyStats());
    const [correctWord, setCorrectWord] = useState<string>(getRandomWord());
    const [isWin, setIsWin] = useState<boolean>(false);
    const [isLose, setIsLose] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [keyboardActive, setKeyboardActive] = useState<boolean>(true);
    const [isDebug, setIsDebug] = useState(false);
    const restartTimer = useRef<number>();

    const save: SaveState = {board, stats, isLose, isWin, pointer, correctWord};

    useEffect(() => {
        importSave();
    }, []);

    useEffect(() => {
        exportSave();
    }, [board, pointer, correctWord, stats]);

    useEffect(() => {
        if(!keyboardActive)
            return;
        const handleKeydown = (ev: KeyboardEvent) => {
            const key = ev.code.toLowerCase();
            if(isWin || isLose)
                handleRestartGame();
            else
            {
                if(key === "controlright")
                    setIsDebug(prevState => !prevState);
                if(key === "backspace")
                    handleBackspace(pointer);
                if(key === "enter" || key === "numpadenter")
                    handleEnter(pointer);
                if('keya' <= key && 'keyz' >= key)
                    handlePressed(key[3].toLowerCase(), pointer);
                if(key === "arrowleft")
                    setPointer((prevState: PointerState) => {
                        return { row: prevState.row, col: prevState.col ? prevState.col - 1 : 0 };
                    });
                if(key === "arrowright")
                    setPointer((prevState: PointerState) => {
                        return { row: prevState.row, col: prevState.col + 1 === WORD_LENGTH ? prevState.col : prevState.col + 1 };
                    });
            }
        };

        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown);
    }, [pointer, isWin, keyboardActive]);

    useEffect(() => {
        if(isWin)
        {
            restartTimer.current = +setTimeout(handleRestartGame, 10000);
            toast.success(`You win! The correct word was: ${correctWord.toUpperCase()}\nNew game starts in 10s`, { theme: "dark", autoClose: 10000, closeButton: false, onClick: handleRestartGame,  });
            toast.success("+1 EXP", { theme: "dark", autoClose: 10000, closeButton: false, onClick: handleRestartGame, });
            setStats((prevState) => {
               const nextState: StatsState = { ...prevState };
               nextState.correct++;
               nextState.exp++;
               if(nextState.exp === getMaxLevelExp(nextState.level))
               {
                   nextState.level++;
                   nextState.exp = 0;
               }
               return nextState;
            });
        } else if(isLose)
        {
            restartTimer.current = +setTimeout(handleRestartGame, 10000);
            toast.error(`You lose! The correct word was: ${correctWord.toUpperCase()}\nNew game starts in 10s`, { theme: "dark", autoClose: 10000, closeButton: false, onClick: handleRestartGame,  });
            toast.error("-1 EXP", { theme: "dark", autoClose: 10000, closeButton: false, onClick: handleRestartGame, });
            setStats((prevState) => {
                const nextState: StatsState = { ...prevState };
                nextState.wrong++;
                if(nextState.exp)
                    nextState.exp--;
                return nextState;
            });
        }
        return () => clearTimeout(restartTimer.current);
    }, [isWin, isLose]);

    const importSave = () => {
        setIsLoading(true);
        try {
            const data: SaveState = getImportData(localStorage.getItem("data") ?? "");
            if(data.board)
                setBoard(data.board);
            if(data.pointer)
                setPointer(data.pointer);
            if(data.stats)
                setStats(data.stats);
            if(data.correctWord)
                setCorrectWord(data.correctWord);
            if(data.isLose || data.isWin)
                handleRestartGame();
        }
        catch(e)
        {
            console.log("No stats")
            setStats(getEmptyStats());
            handleRestartGame();
        }
        finally {
            setIsLoading(false);
        }
    };

    const exportSave = () => {
        if(isLoading)
            return;
        localStorage.setItem("data", getExportString(save));
    };

    const currentWord = useMemo(() => {
        return board[pointer.row]
            .map((cell) => cell.letter)
            .join('')
    }, [board, pointer]);

    const handleBackspace = (pointer: PointerState) => {
        let noPointerMove = false;
        setBoard((prevState) => {
           const nextState = deepCopyBoard(prevState);
           if (!pointer.col || (pointer.col + 1 === WORD_LENGTH && nextState[pointer.row][pointer.col].letter))
           {
               nextState[pointer.row][pointer.col].letter = "";
               noPointerMove = true;
           }
           else
               nextState[pointer.row][pointer.col - 1].letter = "";
           return nextState;
        });
        setPointer((prevState: PointerState) => {
            const nextState: PointerState = { ...prevState };
            if(!noPointerMove)
                nextState.col--;
            return nextState;
        });
    }

    const handlePressed = (button: string, pointer: PointerState) => {
        if(button === ' ')
            return;
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
                        else if (
                            correctWord.includes(cell.letter)
                            && correctWord.lastIndexOf(cell.letter) === correctWord.indexOf(cell.letter)
                        )
                            cell.state = 'semi-correct';
                        else
                            cell.state = 'incorrect';
                    });
                    return nextState;
                });
                if(pointer.row + 1 === ROW_COUNT)
                    setIsLose(true);
                else
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

    const handleBoardPressed = (row: number, col: number) => {
        if(pointer.row === row)
            setPointer((prevState: PointerState) => ({ row: prevState.row, col: col }));
    };

    const handleRestartGame = () => {
        toast.dismiss();
        toast.info("New game started!", { theme: "dark" });
        setBoard(getEmptyBoard());
        setPointer(getStartPointer());
        setCorrectWord(getRandomWord());
        setIsWin(false);
        setIsLose(false);
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
            <div className="flex">
                <div className="wrapper">
                    <MainBoard board={board} pointer={pointer} onPressed={handleBoardPressed} />
                    <Keyboard onBackspace={handleBackspace} onPressed={handlePressed} onEnter={handleEnter}
                          onNewGame={handleRestartGame} pointer={pointer} letterStates={letterStates}/>
                    <Debug isDebug={isDebug} correctWord={correctWord} save={save} />
                </div>
                <Stats {...stats} exportString={getExportString(save)} onImport={importSave}
                       setKeyboardActive={setKeyboardActive} />
            </div>
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

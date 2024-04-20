import {FaDeleteLeft} from "react-icons/fa6";
import React from "react";
import {LetterState, PointerState} from "./Table";

const rows = ["qwertyuiop", "1asdfghjkl", "23zxcvbnm-"];
const buttons = rows.map(row => row.split(""));

type Props = {
    onBackspace: (pointer: PointerState) => void,
    onPressed: (button: string, pointer: PointerState) => void,
    onEnter: (pointer: PointerState) => void,
    onNewGame: () => void,
    pointer: PointerState,
    letterStates: { [letter: string]: LetterState },
};

export const Keyboard = ({ onBackspace, onPressed, onEnter, onNewGame, pointer, letterStates }: Props) => {
    return (
        <div className="keyboard">
            <table>
                <tbody>
                {buttons.map((buttonRow, buttonRowIndex) =>
                    <tr key={buttonRowIndex}>
                        {buttonRow.map((button, buttonIndex) => {
                            if (buttonIndex + 1 === buttonRow.length && buttonRowIndex + 1 === buttons.length)
                                return <td onClick={() => onBackspace(pointer)} key="backspace"><FaDeleteLeft/></td>
                            else if(button >= "1" && button <= "3")
                                return <td key={button}></td>
                            else
                                return <td className={letterStates[button]} onClick={() => onPressed(button, pointer)}
                                           key={button}>{button}</td>
                        })
                        }
                    </tr>
                )}
                <tr>
                    <td colSpan={10} onClick={() => onEnter(pointer)}>
                        enter
                    </td>
                </tr>
                <tr>
                    <td colSpan={10} onClick={onNewGame}>
                        new word
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    );
};
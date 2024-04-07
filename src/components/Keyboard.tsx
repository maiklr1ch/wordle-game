import {FaDeleteLeft} from "react-icons/fa6";
import React from "react";

const rows = ["qwertyuiop", " asdfghjkl", "  zxcvbnm-"];
const buttons = rows.map(row => row.split(""));

type Props = {
    onBackspace: () => void,
    onPressed: (button: string) => void
};

export const Keyboard = ({ onBackspace, onPressed }: Props) => {
    return (
        <div className="keyboard">
            <table>
                <tbody>
                {buttons.map((buttonRow, buttonRowIndex) =>
                    <tr>
                    {buttonRow.map((button, buttonIndex) => {
                        if (buttonIndex + 1 === buttonRow.length && buttonRowIndex + 1 === buttons.length)
                            return <td onClick={() => onBackspace()} key="backspace"><FaDeleteLeft/></td>
                        else
                            return <td onClick={() => onPressed(button)} key={button}>{button}</td>
                        })
                    }
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};
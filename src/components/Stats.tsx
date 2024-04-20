import {StatsState} from "./Table";
import {getMaxLevelExp} from "../utils/level";
import {useEffect, useState} from "react";
import {FaFileExport, FaFileImport, FaRegTrashCan} from "react-icons/fa6";
import {toast} from "react-toastify";

type Props = {
    exportString: string,
    onImport: () => void,
    setKeyboardActive: (newState: boolean) => void
} & StatsState;

export const Stats = ({ level, exp, correct, wrong, exportString, onImport, setKeyboardActive }: Props) => {
    const [activeUtil, setActiveUtil] = useState<'import' | 'export' | 'wipe'>();
    const [importData, setImportData] = useState<string>('');

    useEffect(() => {
        setKeyboardActive(activeUtil === undefined);
    }, [setKeyboardActive, activeUtil]);

    const handleImport = () => {
        localStorage.setItem("data", importData);
        onImport();
        setImportData('');
        setActiveUtil(undefined);
    };

    const handleExport = () => {
        navigator.clipboard
            .writeText(exportString)
            .then(() => toast.success("Copied to clipboard!", { theme: "dark" }));
    };

    const handleWipe = () => {
        localStorage.clear();
        onImport();
        setActiveUtil(undefined);
        toast.success("Wiped!", { theme: "dark" })
    };

    const utilsPanel = (activeUtil !== undefined)
        &&
        <div className="utils">
            {
                activeUtil === 'import'
                &&
                <>
                    <h4>Import <FaFileImport/></h4>
                    <div className="red-text">All game will be OVERWRITTEN</div>
                    <input
                        type="text"
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                    />
                    <button onClick={handleImport}>Apply</button>
                    <button onClick={() => setActiveUtil(undefined)}>Cancel</button>
                </>
            }
            {
                activeUtil === 'export'
                &&
                <>
                    <h4>Export <FaFileExport /></h4>

                    <button onClick={handleExport}>Copy data</button>
                    <button onClick={() => setActiveUtil(undefined)}>Cancel</button>
                </>
            }
            {
                activeUtil === 'wipe'
                &&
                <>
                    <h4 style={{color: "red"}}>Wipe <FaRegTrashCan/></h4>

                    <div className="red-text">You are going to WIPE all data. Sure?</div>
                    <button className="red-button" onClick={handleWipe}>OK</button>
                    <button onClick={() => setActiveUtil(undefined)}>Cancel</button>
                </>
            }
        </div>;

    return (
        <div className="side-panel">
            <div className="stats">
                Your level is <span>{level}</span><br/>
                Your experience is <span>{exp}/{getMaxLevelExp(level)}</span><br/>
                Correct words: <span>{correct}</span><br/>
                Wrong words: <span>{wrong}</span><br/>
                <button onClick={() => setActiveUtil('import')}>import</button>
                <button onClick={() => setActiveUtil('export')}>export</button>
                <button onClick={() => setActiveUtil('wipe')} className="red-button">wipe all</button>
            </div>

            {utilsPanel}
        </div>
    );
};
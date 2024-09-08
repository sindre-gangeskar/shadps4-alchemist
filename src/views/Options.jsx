import React, { useEffect } from "react";
import '../css/Options.css';
import useGlobalStateStore from "../js/globalStateStore";
function Options() {
    const [ shadPS4Location, setShadPS4Location ] = useGlobalStateStore(state => [ state.shadPS4Location, state.setShadPS4Location ]);
    const [ libraryDirectory, setLibraryDirectory ] = useGlobalStateStore(state => [ state.libraryDirectory, state.setLibraryDirectory ])
    const [ modsDirectory, setModsDirectory ] = useGlobalStateStore(state => [ state.modsDirectory, state.setModsDirectory ])

    useEffect(() => {
        setShadPS4Location(shadPS4Location);
        setLibraryDirectory(libraryDirectory);
        setModsDirectory(modsDirectory);
    }, [ shadPS4Location, libraryDirectory ])

    return (
        <>
            <div className="options-wrapper">
                <div className="option">
                    <p className="bold name">ShadPS4 Location:</p>
                    <code className="path">{shadPS4Location ? shadPS4Location : 'No shadPS4.exe location specified'}</code>
                </div>
                <div className="option">
                    <p className="bold name">Library Location:</p>
                    <code className="path">{libraryDirectory ? libraryDirectory : 'No library directory specified'}</code>
                </div>
                <div className="option">
                    <p className="bold name">Mods Location:</p>
                    <code className="path">{modsDirectory ? modsDirectory : 'No mods directory specified'}</code>
                </div>
            </div>
        </>
    )
}

export default Options;
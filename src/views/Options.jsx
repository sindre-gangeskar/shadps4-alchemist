import React from "react";
import '../css/Options.css';
function Options() {
    return (
        <>
            <div className="about-wrapper">
                <p className="bold">ShadPS4 Mod Manager</p>
                <p>
                    This application was made to simplify the process of modding unpackaged ShadPS4 games.
                </p>
                <p className="bold">Why use this?</p>
                <p>
                    Installing mods for these games can be destructive and requires the modified files to replace the original ones in the game's folder.
                </p>
                <p>
                    This application is targeted to keep things non-destructive when installing mods for ShadPS4 games specifically.
                </p>
                <p className="bold">How does it work?</p>
                <p>
                    When you install a mod, it will compress the original files into an archive and move them away from the game's folder.
                </p>
                <p>
                    It will then proceed to take the modded files and place them in the respective location for each modded file.
                </p>


            </div>
        </>
    )
}

export default Options;
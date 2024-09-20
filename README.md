<h1 align="center">
  <br>
  <a href="https://github.com/sindre-gangeskar/shadps4-mm"><img src="https://github.com/sindre-gangeskar/shadps4-mm/blob/main/.github/shadps4-alchemist.jpg" width="800"></a>
  <br>
  <span><br>
    <b>A mod manager and games launcher for</b><a href="https://github.com/shadps4-emu/shadPS4"> shadps4</a>
  </span>
 
  <br>
</h1>

<p align="center">
  <img src="https://github.com/sindre-gangeskar/shadps4-mm/blob/main/documents/screenshots/library.png" width="400">
  <img src="https://github.com/sindre-gangeskar/shadps4-mm/blob/main/documents/screenshots/game-settings.png" width="400">
</p>


### Under development
A pre-release is out but it is bare-bones and meant for testing. 
It has the core functionality in place, enabling and disabling mods is functional as well launching games through shadPS4 Alchemist. 
Please see the releases section. 

### How does it work in terms of installing mods? 
- It renames the original file to keep things non-destructive with a prefix of an underscore "_". 
- It proceeds to create hardlinks for each file and place them where the original file is located with the same name as the original file without the prefix of "_" making it seem like it is the original file and shadPS4 will register that as the file to read

### What is a hardlink?
- A hardlink is a pointer to a file that is located elsewhere on the same drive, essentially a "shortcut"
- shadPS4 Alchemist does **not** copy over each file from the mod directory, but it creates links for each file instead
- A hardlink takes no extra space on your drive. The folder may appear larger, but the actual available drive space won’t decrease beyond the size of the mod files.
- **Making any modification to the mod file will reflect upon the link that is placed in the game's folder as well** (When said mod is enabled in shadPS4 Alchemist)

## Discord
If you wish to test or just follow the progress of the project, consider joining the Discord server by 
clicking [here](https://discord.gg/XydC82W6u2).

You can choose to become a Tester by assigning yourself that role in **Channels & Roles** and provide valuable feedback, bug reports and receive troubleshooting support should any issues arise.



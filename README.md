<h1 align="center">
  <br>
  <a href="https://github.com/sindre-gangeskar/shadps4-alchemist"><img src=".github/shadps4-alchemist_transparent.png" width="800"></a>
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
A pre-release is out but it is bare-bones and meant for those who are willing to use as it is now and accepts that unexpected things can occur. 
It has the core functionality in place, enabling and disabling mods is functional as well as launching games through shadPS4 Alchemist. 
Please see the releases section. 

### How does it work in terms of installing mods? 
- It renames the original file to keep things non-destructive with a prefix of an underscore "_". 
- It proceeds to create a hard link for each file and places them where the originals are located with the same name as the original without the prefix of "_"

### What is a hardlink?
- A hard link is a pointer to a file that is located elsewhere, essentially a "shortcut"
- shadPS4 Alchemist does **not** copy over each file from the mod directory, but it creates links for each file instead
- A hard link does not take any more space, the folder may seem to be larger in size, but your actual drive's available space should not shrink any more than 
what the mod files themselves take. 

## Discord
If you wish to test or just follow the progress of the project, consider joining the Discord server by 
clicking [here](https://discord.gg/XydC82W6u2).

You can choose to become a Tester by assigning yourself that role in **Channels & Roles** and provide valuable feedback, bug reports and receive troubleshooting support should any issues arise.



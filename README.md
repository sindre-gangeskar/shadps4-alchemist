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
** How does shadPS4 Alchemist work in terms of installing mods? **
- It renames the original file to keep things non-destructive with a prefix of an underscore "_". 
- It proceeds to create hardlinks for each file and place them where the original file is located with the same name as the original file without the prefix of "_"

### What is a hardlink? 
- A hardlink is a pointer to a file that is located elsewhere on the same drive, essentially a "shortcut"
- shadPS4 Alchemist does **not** copy over each file from the mod directory, but it creates links for each file instead
- A hardlink does not take any more space, the folder may seem to be larger in size, but your actual drive's available space should not shrink any more than what the mod files themselves take. 

## Discord
If you wish to test or just follow the progress of the project, consider joining the Discord server by 
clicking [here](https://discord.gg/XydC82W6u2).

You can choose to become a Tester by assigning yourself that role in **Channels & Roles** and provide valuable feedback and bug reports.



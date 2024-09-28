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
  <img src="https://github.com/sindre-gangeskar/shadps4-alchemist/blob/main/documents/screenshots/library.png" width="400">
  <img src="https://github.com/sindre-gangeskar/shadps4-alchemist/blob/main/documents/screenshots/game-settings.png" width="400">
</p>


### Under development
A pre-release is out but it is bare-bones and meant for those who are willing to use as it is now and accepts that unexpected things can occur. 
It has the core functionality in place, enabling and disabling mods are functional as well as launching games through shadPS4 Alchemist.

### Planned features
- Linux and MacOS Support
- Drag'n drop functionality for installing mods
- Creating mods that maintains the proper structure and relative path to the files in question
- Improved conflict detection - Notify which mod is conflicting when attempting to enable a mod
- And more

### Install
Please see the [**releases**](https://github.com/sindre-gangeskar/shadps4-alchemist/releases) section for the latest builds available. 

### Instructions
Follow the instructions for installing a mod by visiting [**Instructions**](./documents/Instructions.md)

### How does it work in terms of installing mods? 
- It renames the original file to keep things non-destructive with a prefix of an underscore "_". 
- It proceeds to create a hard link for each file and places them where the originals are located with the same name - taking the original's place while keeping the original untouched.

### What is a hard link?
- A hard link is a pointer to a file that is located elsewhere, essentially a "shortcut"
- shadPS4 Alchemist does **not** copy over each file from the mod directory, but it creates links for each file instead
- A hard link does not take any more space, the folder may seem to be larger in size, but your actual drive's available space should not shrink any more than 
what the mod files themselves take. 

## Discord
Join the official Discord server by clicking [**here**](https://discord.gg/XydC82W6u2).
- This server has roles available that you can assign yourself in **Channels & Roles** once you join the server.
- Assign yourself the role of **Follower** if you'd like to observe the testing channels
- Assign yourself the role of **Tester** if you'd like to test the app as it develops and provide valuable feedback and bug reports in the testing channels

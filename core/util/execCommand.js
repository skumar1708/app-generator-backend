const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function deleteFolder(folderName) {
  const folderPath = path.join(__dirname, "generated", folderName); // Construct path relative to script

  // Cross-platform command (rm -rf on Linux/macOS, rd /s /q on Windows)
  const command = process.platform === 'win32'
    ? `rd /s /q "${folderPath}"` // Windows
    : `rm -rf "${folderPath}"`;   // macOS/Linux

  console.log(`Attempting to delete folder: ${folderPath}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error deleting folder: ${error.message}`);
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      return;
    }

    console.log(`Folder "${folderName}" deleted successfully.`);
    if (stdout) {
      console.log(`Stdout: ${stdout}`);
    }
  });
}



// Example usage:  Delete a folder named "my_folder" in the same directory as the script.
// const folderToDelete = "my_folder"; // Replace with the actual folder name
// deleteFolder(folderToDelete);


// // Example usage with error handling for non-existent directory.
// const folderToDelete2 = "non_existent_folder";
// fs.access(path.join(__dirname, folderToDelete2), (err) => {
//     if(err){
//         console.log("Folder does not exist")
//     }else{
//         deleteFolder(folderToDelete2)
//     }
// })

module.exports = {
    deleteFolder
}
let fs = require('fs');
const { readdirSync, statSync } = require('fs')
const { join } = require('path')
const uploads = "./public/uploads";

//This function returns an array of all files/folders in uploads && routes && keywords for parsing
function pullFolderAndFileList() {


    return new Promise(function (resolve, reject) {

        

        // gets all folders
        const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory())

        //list of keyword directories
        let directories = dirs(uploads);
        let folderPaths = [];

        // gets lists of files in each keyword and assembles into array of arrays containing [[1,2,3,4],[1,2,3,4]]
        // directoryRoute, is how to get to the right directory for each database 1
        // fileRoute, is the full route to the database 2
        // directoryNameForURL, is the name we will use for the database in the URL requests 3
        // directoryName is the keyword used as the index 4
        if (Array.isArray(directories)) {
            directories.forEach(directoryName => {
                let directoryRoute = uploads.replace("uploads", "uploads/" + directoryName);

                let callReadDir = new Promise((resolve, reject) => {
                    // excluding quarantine directory where files are uploaded, parsed, and copied to uploads directories
                    if (directoryName == "Quarantine") {
                        resolve()
                    } else {

                        let directoryRoute = uploads.replace("uploads", "uploads/" + directoryName);
                        fs.readdir(directoryRoute, (err, files) => {
                            //list of file names
                            resolve(files)
                        });
                    }
                });

                callReadDir.then((message) => { // use function above
                    let verifiedFiles = []
                    if (Array.isArray(message)) {
                        message.forEach(file => {
                            if(verifyFiles(file)){
                                verifiedFiles.push(file)
                            }
                        })}

                    filesAction(verifiedFiles); // assemble into array

                    setTimeout(() => {
                        resolve(folderPaths) //return to sender
                    }, 200);
                })

                function filesAction(files) {
                    if (Array.isArray(files)) {
                        files.forEach(file => {
                            //for each file name make a route and return it in an array
                            let directoryNameForURL = directoryName + "-" + file.replace(".csv", "");
                            let fileRoute = directoryRoute + "/" + file;
                            let path = [directoryRoute, fileRoute, directoryNameForURL, directoryName]
                            // second catch - excluding quarantine directory where files are uploaded, parsed, and copied to uploads directories
                            if (directoryNameForURL != "Quarantine") {
                                folderPaths.push(path);
                            }
                        });
                    }
                }

                function verifyFiles(file){
                    console.log("checking " +directoryName +"/" + file)
                    var filename = "./public/uploads/"+directoryName+"/"+file;
                    try{
                    var res = fs.openSync(filename, 'r')} catch(err){
                        console.log("failed " + file + err)
                        return false
                        }
                    
                        return true
                }
            });
        }



    })


}

module.exports = { pullFolderAndFileList }
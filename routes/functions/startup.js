
const fs = require('fs');

const uploads = "./public/uploads";
let folderPath = [];

const parseDB = require('./parseDB');
const pullFolderAndFileList = require('./pullFolderAndFileList');

let dataObject = undefined;
dataObject = {};


function startup(firstLaunch) {
    // console.log(firstLaunch)
    return new Promise(function (resolve, reject) {
        pullFolderAndFileList.pullFolderAndFileList().then(

            async function (response) {
                folderPath = response;
                const len = folderPath.length

                for (const [index, element] of folderPath.entries()) {
                    console.log("Startup: Found directories - index term ", element[2])
                    let directoryRoute = element[0];
                    let fileRoute = element[1];
                    let directoryNameForURL = element[2];
                    let keyword = element[3];
                    console.log("parsing database",index+1," of ", len)


                    const contents = await parseDB.parseDB(fileRoute, keyword, directoryNameForURL).then(
                        function (response2) {
                            //IF unable to parse file return error for given file keyword
                            if (response2["error"] == true) {
                                console.log("db " + directoryNameForURL + " is not valid, please fix the csv and reupload")
                                directoryNameForURL = directoryNameForURL
                                dataObject[directoryNameForURL] = response2;
                                dataObject[directoryNameForURL]["message"] = "db " + directoryNameForURL + " is not valid, please fix the csv and reupload";
                                if(firstLaunch){
                                if(index >= len -1){
                                    resolve(dataObject)
                                }}else{
                                    resolve(dataObject)
                                }
                            } else {
                                //assign returned data set to dataObject
                                dataObject[directoryNameForURL] = response2;
                                if(firstLaunch){
                                    if(index >= len -1){
                                        resolve(dataObject)
                                    }}else{
                                        resolve(dataObject)
                                    }
                            }
                        }
                    )
                }


            }, function (error) { // if error in pullFolderAndFileList
                console.error("Failed during pullFolderAndFileList!", error);
            }
            )

    })




}



// add the code below 
module.exports = { startup }
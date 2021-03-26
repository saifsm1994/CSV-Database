
    const fs = require('fs');

    const uploads = "./public/uploads";
    let folderPath = [];
   
    const parseDB = require('./parseDB');
    const pullFolderAndFileList = require('./pullFolderAndFileList');

    let dataObject = undefined;
    dataObject = {};


  function startup(){

    return new Promise(function(resolve, reject) {
    pullFolderAndFileList.pullFolderAndFileList().then(
        
        function(response) {
            folderPath = response;


            //for each file in folderpath call database parser
            folderPath.forEach(element => {
                console.log("Startup: Found directories - index term " ,element[2])
                let directoryRoute = element[0];
                let fileRoute = element[1];
                let directoryNameForURL = element[2];
                let keyword = element[3];
                // console.log("startup - fileRoute",fileRoute,"\n","startup- keyword",keyword)

                //second promise function, takes our list of directories and keywords and parses them into DataObject
                parseDB.parseDB(fileRoute,keyword,directoryNameForURL).then(
                    function(response2){
                        if(response2["error"] == true){
                            console.log("db " + directoryNameForURL + " is not valid, please fix the csv and reupload")
                            directoryNameForURL = directoryNameForURL
                            dataObject[directoryNameForURL] = response2;
                            dataObject[directoryNameForURL]["message"] = "db " + directoryNameForURL + " is not valid, please fix the csv and reupload";
                        }else{
                        //assign returned data set to dataObject
                        dataObject[directoryNameForURL] = response2;
                        resolve(dataObject)
                        }
                    }
                )
            });

        }, function(error) {
        console.error("Failed!", error);
      })

   })

        


}
  
  
  
  // add the code below 
  module.exports = {startup }
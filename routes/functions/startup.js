
    const fs = require('fs');
    let csv = require("fast-csv");

    const uploads = "./public/uploads";
    let folderPath = [];
   
    const parseDB = require('./parseDB');
    const pullFolderAndFileList = require('./pullFolderAndFileList');

    let dataObject = {};


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
                        //assign returned data set to dataObject
                        dataObject[directoryNameForURL] = response2;

                        console.log("from startup: " + directoryNameForURL + " has been parsed with " + Object.keys( dataObject[directoryNameForURL]).length +" entries")

                        resolve(dataObject)

                        // console.log("\nfrom startup: directoryNameForURL:",directoryNameForURL)
                        // console.log("\nfrom startup: dataObject keys:",Object.keys(dataObject))

                        // when fully run
                        //take action on each returnd value
                        Object.keys(dataObject).forEach((key)=>{
                            
                        console.log("from startup: dataObject has parsed the file found at " + fileRoute + " into the route " + key + " which has the following number of keys " , Object.keys(dataObject[key]).length)
                   })


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
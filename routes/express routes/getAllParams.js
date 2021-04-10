var express = require('express')
var router = express.Router()
var ip = require('ip')
const fs = require('fs')

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
  next()
})
// define the home page route
router.get('/', function (req, res) {

    let dataObject = req.app.get('dataObject');
    console.log(Object.keys(dataObject).length)
    let port = req.app.get('port');

    if(dataObject){
        let availableDatabases = Object.keys(dataObject);
        let returnObj = {}
    
        availableDatabases.forEach(element => {
            let databaseName = element;
            let database = dataObject[element];
            let databaseKeys = Object.keys(dataObject[element])
            let databaseSize = databaseKeys.length
            let databaseHeaders = dataObject[element]["headers"];
            let databaseKeyword = element.split("-")[0]
            let databaseFile = element.split("-")[1]
            
            if(element.split("-").length > 2){ // catch in case file name includes dashes
                element.split("-").forEach((element,index) => {
                    if(index > 1){
                        databaseFile = databaseFile+"-"+element
                    }
                });
            }
            let error = false;

            if(database["error"] == true){
                error = database["error"]
            }

            if(verifyFiles(databaseFile,databaseKeyword)){

            returnObj[databaseName] = {
                databaseKeyword:databaseKeyword,
                databaseFile:databaseFile,
                databaseSize:databaseSize,
                databaseHeaders:databaseHeaders,
                error:error
            }}else{}
        });

        let vefifiedAvailableDatabases = Object.keys(returnObj);
        let basicInfo = {databases: vefifiedAvailableDatabases, ip: ip.address()+":"+port+""}
        returnObj.basicInfo = basicInfo

        res.send(returnObj)

        function verifyFiles(file,directoryName){
            var filename = "./public/uploads/"+directoryName+"/"+file+".csv";
            console.log("checking " + filename)
            try{
            var res = fs.openSync(filename, 'r')} catch(err){
                console.log("failed " + file + err)
                console.log("failed, more info: fileroute tried = " + filename )
                return false
                }
            
                return true
        }
    }

})


module.exports = router
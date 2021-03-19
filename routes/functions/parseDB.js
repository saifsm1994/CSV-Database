let fs = require('fs');
let csv = require("fast-csv");

let objOfError = {};
let onerunObjOfError = true; 


// this function takes in a file route and keyword and returns an object of the file parsed as a csv with the keyword being the index
function parseDB(fileLocation,keyword,directoryNameForURL) {
    return new Promise(function(resolve, reject) {

    let filetoParse = fileLocation;
    let indexWord = keyword
    console.log("parseDB: - parsing ", fileLocation, " + ", indexWord)
    
    let objOfData = {};
    let Keywords =["0","1"];
    objOfError = {};
    let entries = 0;
    let returnArray;
    let countOfDupes = 0;


    let stream = fs.createReadStream(filetoParse);
        stream.on('error',function(err){
                console.log("err:  ", err);
            })

    csv 
    .fromStream(stream, {headers : true})
    .on("data", function(data){

        let key = data[indexWord].trim() // remove blank spaces around key for uniformity
        
        if(Number.isInteger(key)){}else{
            key = key.toLowerCase()  //set key to lowercase to simplify lookup
        }

        // if keyword has already been used > append values together

        if (
            objOfData[key] && //if duplicate And
            // objOfData[key] != trimEachElementInObject(data) &&  //if values are unique And
            key != "" //if key is not blank
            ){
                if(objOfData[key]["mult"]){ //adds property mult to indicate it's a multilayer object
                    newObj = objOfData[key];
                    let newKey = Object.keys(newObj).length + 1
                    newObj[newKey] = trimEachElementInObject(data);
                    objOfData[key] = newObj;
                }else{
                    newObj = {
                        mult: "multer",
                        1: objOfData[key],
                        2: trimEachElementInObject(data)
                    }
                    objOfData[key] = newObj;

                }


        countOfDupes++
    }else{
            objOfData[key.toLowerCase()] = trimEachElementInObject(data);
            headers = Object.keys(objOfData[key.toLowerCase()])
            objOfData["headers"] = headers;

        }       
        
        entries++;

        if(entries <= 50000 && entries % 25000 === 0){
            console.log("parseDB - entries parsed", entries); 
        }
        if(entries >= 100000 && entries % 50000 === 0){
            console.log("parseDB - entries parsed", entries); 
        }

     }
    )
    .on("end", function(){
        console.log("parseDB - entries parsed", entries); 
        returnArray = objOfData;
        if(true){console.log("ParseDB returnArray created/updated")}
        Object.keys(returnArray).forEach(element => {

        });

        console.log("parseDB - parsing of " + fileLocation + " has finished. A total of entries parsed ",entries, " A total of ", countOfDupes , "dupes were found"); 
            resolve(returnArray)
    }); 
})
}
  
function sendObjOfError(reqDatabase){
    return objOfError[reqDatabase]
}

function trimEachElementInObject(obj){
    let returnObj = {}
    Object.keys(obj).forEach(element => {
        let trimElm = element.trim()
        returnObj[trimElm] = obj[element].trim()
    });
    return returnObj

}
  // add the code below
  module.exports = { parseDB,sendObjOfError }
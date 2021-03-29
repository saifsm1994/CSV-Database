let fs = require('fs');
let csv = require("fast-csv");

let onerunObjOfError = true;


// this function takes in a file route and keyword and returns an object of the file parsed as a csv with the keyword being the index
function parseDB(fileLocation, keyword, directoryNameForURL) {
    return new Promise(function (resolve, reject) {

        let objOfError = {};
        let filetoParse = fileLocation;
        let indexWord = keyword
        // console.log("parseDB: - parsing ", fileLocation, " + ", indexWord)

        let objOfData = {};
        // let Keywords =["0","1"];
        let entries = 0;
        let returnObj;
        let countOfDupes = 0;


        let stream = fs.createReadStream(filetoParse);
        stream.on('error', function (err) {
            console.log("err:  ", err);
        })

        let parsed = resolve(parseFile())

        function parseFile() {
            return new Promise(function (resolve, reject) {
                let noKeyCount = 0;
                csv
                .fromStream(stream, { headers: true })
                .on('error', function(error){
                    console.log(error)
                    objOfError["error"] = true
                    objOfError ["db"] = directoryNameForURL
                    resolve(objOfError)
                })
                .on("data", function (data) {

                    let key = data[indexWord].trim() // remove blank spaces around key for uniformity
                    if(key == ""){
                        // console.log(key,"no key found for a row, please ensure all rows have a value in the chosen identifier/index term field")
                        key = "no key found"
                        data[indexWord] = key
                        noKeyCount++
                    }

                    if (Number.isInteger(key)) { } else {
                        key = key.toLowerCase()  //set key to lowercase to simplify lookup
                    }

                    // if keyword has already been used > append values together

                    if (
                        objOfData[key] && //if duplicate And
                        // objOfData[key] != trimEachElementInObject(data) &&  //if values are unique And
                        key != "" //if key is not blank
                    ) {
                        if (objOfData[key]["mult"]) { //adds property mult to indicate it's a multilayer object
                            newObj = objOfData[key];
                            let newKey = Object.keys(newObj).length + 1
                            newObj[newKey] = trimEachElementInObject(data);
                            objOfData[key] = newObj;
                        } else {
                            newObj = {
                                mult: "multer",
                                1: objOfData[key],
                                2: trimEachElementInObject(data)
                            }
                            objOfData[key] = newObj;

                        }


                        countOfDupes++
                    } else {
                        objOfData[key.toLowerCase()] = trimEachElementInObject(data);
                        headers = Object.keys(objOfData[key.toLowerCase()])
                        objOfData["headers"] = headers;
                    }

                    entries++;
                    if (entries == 1) {
                        console.log("parseDB - running on", fileLocation, " + ", indexWord );
                    }
                })
                .on("end", function () {
                    console.log("parseDB - entries parsed for", fileLocation, " + ", indexWord, "is", entries);
                    if(noKeyCount > 0){console.log("no key found for "  + noKeyCount + " rows, please ensure all rows have a value in the chosen identifier/index term field")}
                    returnObj = objOfData;
                    resolve(returnObj)
                });
            })
        }

    })
}

function sendObjOfError(reqDatabase) {
    return objOfError[reqDatabase]
}

function trimEachElementInObject(obj) {
    let returnObj = {}
    Object.keys(obj).forEach(element => {
        let trimElm = element.trim()
        returnObj[trimElm] = obj[element].trim()
    });
    return returnObj

}
// add the code below
module.exports = { parseDB, sendObjOfError }
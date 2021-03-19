const express = require('express')
const startup = require('./routes/functions/startup');
const paginationFunction = require('./routes/functions/paginationFunction');
const fs = require('fs')
const bodyParser = require('body-parser')
var formidable = require('formidable');
var ip = require('ip')


let dataObject = {};


const app = express();
const port = 3000;
app.use(express.urlencoded());
app.use(express.json());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());



app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:"+port+""); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

startup.startup().then(
    function (responseStartup) {
        dataObject = responseStartup
    });



app.post('/:database/postSearchLogger', bodyParser.json(), function (req, res) { //test route, returns search params only
    const request = req.body
    console.log(request)
    res.send(req.body)
})

// Search function 
app 
.post('/:database/postSearch', bodyParser.json(), function (req, res) {
    const request = req.body
    console.log(request)

    //Inputs 

    //pagination - partial (1k) or full (all results - using the number 5k as a stand in)
    //page - if partial
    let pagination = 1000; // req.body.pagination
    let page = 1;// req.body.page
    if (req.body.pagination && Number.isInteger(Number.parseInt(req.body.pagination))) { pagination = Number.parseInt(req.body.pagination) }
    if (req.body.page && Number.isInteger(Number.parseInt(req.body.page))) { page = Number.parseInt(req.body.page) }


    //database - single value (which db to search)
    const reqDatabase = req.param("database");
    let chosenDatabase = dataObject[reqDatabase];
    if (chosenDatabase) { } else { res.send("database not found") }
    let chosenDatabaseKeys = Object.keys(chosenDatabase)


    //searchCat = array
    //searchCombinations = array of arrays, length = searchCat.length, terms to look for in search cat
    // 1 search cat -> 1 array in combinations - search for each of these and append
    let searchCatArray = req.body.orSearchCat; const searchCatArraylen = searchCatArray.length;
    let searchCombinationsArray = req.body.orSearchCombinations; const searchCombinationsArraylen = searchCombinationsArray.length;
    // if (searchCatArraylen !== searchCombinationsArraylen-1) { res.send("database not found" + searchCombinationsArraylen + "-"  + searchCatArraylen) }
    if(!Array.isArray(searchCatArray)){
        searchCatArray = [searchCatArray]
        //REMOVE ONCE FORM BUILT
    }
    if(!Array.isArray(searchCombinationsArray)){
        searchCombinationsArray = [searchCombinationsArray.split(",")]
        //REMOVE ONCE FORM BUILT
    }



    // //search type = array of values mapped to each cat, dictates whether 
    // let searchTypeArray = req.body.searchType;



    let returnObjTemp = {};
    let returnObjTemp2 = {};
    let returnObj = {};

    //Basic search function adds all matches
    searchCatArray.forEach((cat, index) => {
        searchCombinationsArray[index].forEach((searchString, index2) => {
            chosenDatabaseKeys.forEach((key, index3) => {
                if(chosenDatabase[key]["mult"]){
                    let entryContainer = chosenDatabase[key];
                    let entryContainerKeys = Object.keys(entryContainer);
                    entryContainerKeys.forEach(element => {
                        if(element != "mult"){
                            if(chosenDatabase[key][element][cat] && JSON.stringify(chosenDatabase[key][element][cat]).indexOf(searchString) != -1){
                                returnObjTemp[key] = chosenDatabase[key];
                                // console.log(chosenDatabase[key][element][cat])
                            }
                        }
                        
                    });
                }else{
                    if(JSON.stringify(chosenDatabase[key][cat]).indexOf(searchString) != -1){
                        returnObjTemp[key] = chosenDatabase[key];
                    }
                }                   

            });
        });
    });


  //mustInclude = single array of terms that must show up in indexOf
  //mustExclude = single arrayof terms that must NOT show up in indexOf
    let includeArr = req.body.mustInclude.split(",");        let includeArrlen = includeArr.length;
    let excludeArr = req.body.mustExclude.split(",");        let excludeArrlen = excludeArr.length;


    let returnObjKeys1 = Object.keys(returnObjTemp)

    if(includeArrlen > 0 && includeArr[0] != ""){
    includeArr.forEach(mustIncludeString => {
        returnObjKeys1.forEach(includedKey => {
            let stringVal = makeSearchableString(returnObjTemp[includedKey]);
            if(stringVal.indexOf(mustIncludeString) != -1){
                returnObjTemp2[includedKey] = returnObjTemp[includedKey];
            }else{}
        });
    });
}else{
    console.log("no inclusion list")
    returnObjTemp2 = returnObjTemp;
}

if(excludeArrlen > 0 && excludeArr[0] != ""){
    let returnObjKeys2 = Object.keys(returnObjTemp2)
    excludeArr.forEach(mustExcludeString => {
        returnObjKeys2.forEach(includedKey => {
            let stringVal = makeSearchableString(returnObjTemp2[includedKey]);
            if(stringVal.indexOf(mustExcludeString) != -1){
            }else{
                returnObj[includedKey] = returnObjTemp2[includedKey];
            }
        });
    });
}else{
    console.log("no exclusion list")
    returnObj = returnObjTemp2;
}


let returnObjKeys = Object.keys(returnObj);
let returnObjKeyslen = returnObjKeys.length;
let responsePaginationObj = {}

//set pagination limits
let pages = returnObjKeyslen/pagination;
if(page > pages || page == 0){page = 1}
let paginationStart = (page - 1) * pagination;
let paginationEnd = pagination * page;



if( paginationEnd > returnObjKeys.length){
    paginationEnd = returnObjKeys.length;
}



if( pagination == 5000){ 
    pagination = "All";
    responsePaginationObj = returnObj;
}else{
    returnObjKeys.forEach((element,index) => {
        if(index >= paginationStart && index <= paginationEnd){
            responsePaginationObj[element] = returnObj[element];
        }
    });

}

res.send(responsePaginationObj)

})


function makeSearchableString(obj){ // returns obj as string without keys
    let stringer = ""
    let keys = Object.keys(obj);
    keys.forEach(element => {
        if(typeof obj[element]  === "object"){
            let keys2 = Object.keys(obj[element]);
            keys2.forEach(element2 => {
                if(typeof obj[element][element2]  === "object"){
                    stringer += JSON.stringify(obj[element][element2])
                }else{
                    stringer += obj[element][element2]
                }
            });
        }else{
            stringer += obj[element]
        }
    });
    return stringer
}

//Delete databases, no security
app.get('/delete/:database/', (req, res) => {
    const reqDatabase = req.param("database");
    let folder = reqDatabase.split("-")[0]
    let file = reqDatabase.split("-")[1]

    if(dataObject[reqDatabase]){
        fs.unlink("./public/uploads/"+folder+"/"+file+".csv", (err) => {
            if (err) {
                console.log("failed to delete local file: "+err);
            } else {
                console.log('successfully deleted local file '+file);                                
            }
    });
    }else{
    res.send("database does not exist")
    }
}
);

//lookup based on keys, get route
app.get('/:database/:indexID/', (req, res) => {
    const reqDatabase = req.param("database");
    let indexID = req.param("indexID").toLowerCase();
    indexID = indexID.split(",");
    let chosenDatabase = dataObject[reqDatabase];
    let returnObj = []
    indexID.forEach(element => {
        if(chosenDatabase && chosenDatabase[element]){
            returnObj.push(chosenDatabase[element])
        }
    });    


    res.send(returnObj)

});

//alternate commands, not planned yet 
//probably get a list f the databases, and the headers
app.get('/info/:database/:command', (req, res) => {
    const command = req.param("command");
    const reqDatabase = req.param("database");

    let chosenDatabase = dataObject[reqDatabase];
    let availableIDs = Object.keys(chosenDatabase);
    let availableIDsLength = Object.keys(chosenDatabase).length;
    let listOfHeaders = Object.keys(chosenDatabase[availableIDs[0]]);

    // route gets all headers for chosen DB
    if (command == "listOfHeaders" || command == "keywords") {
        res.send({
            listOfHeaders: listOfHeaders
        })
    } else {
        // route gets all IDs for chosen DB
        if (command == "list" || command == "availableIDs") {
            res.send({
                availableIDs: availableIDs
            })
        } else {
            let paginationOptions = paginationFunction.paginationCounter(chosenDatabase)
            // route gets all pagination options for chosen DB
            if (command == "pagination" || command == "paginationChoices") {
                res.send({
                    "pagination Options": paginationOptions
                })
            } else {
                if (command == "info" || command == "informationRequest") {
                    res.send({
                        "pagination Options": paginationOptions,
                        "availableIDsLength": availableIDsLength,
                        "listOfHeaders": listOfHeaders
                    })
                } else {

                    res.status(400).send({
                        message: 'No command OR IndexID chosen '
                    });
                }
            }
        }
    }
})

app.get('/getAllParams', (req, res) => {
    let availableDatabases = Object.keys(dataObject);
    let returnObj = {}
    let basicInfo = {databases: availableDatabases, ip: ip.address()+":"+port+""}
    returnObj.basicInfo = basicInfo

    availableDatabases.forEach(element => {
        let databaseName = element;
        let database = dataObject[element];
        let databaseKeys = Object.keys(dataObject[element])
        let databaseSize = databaseKeys.length
        let databaseHeaders = dataObject[element]["headers"];
        let paginationOptions = paginationFunction.paginationCounter(database);
        let databaseKeyword = element.split("-")[0]
        let databaseFile = element.split("-")[1]
        returnObj[databaseName] = {
            databaseKeyword:databaseKeyword,databaseFile:databaseFile,databaseSize:databaseSize,databaseHeaders:databaseHeaders
        }
    });

    res.send(returnObj)

    function getKey(obj){}

})

app.get('/:database', (req, res) => {
    let reqDatabase = req.param("database");
    let availableKeys = Object.keys(dataObject)
    //if database exists
    if (Object.keys(dataObject).includes(reqDatabase)) {
        let availableKeys = Object.keys(dataObject[reqDatabase])
        res.send(availableKeys)
    } else {
        //send list of databases
        if (reqDatabase == "getDatabaseNames") {
            res.send({
                "Available Databases include": availableKeys
            })
        } else {
            res.status(400).send({
                "Error Message": "Database not found - try localhost:"+port+"/getDatabaseNames"
            })
        }
    }
});

app.get('/', (req, res) => {
    // res.send(dataObject)
    res.status(400).send({
        "Error Message": "Database not selected - try localhost:"+port+"/getDatabaseNames"
    });
});

app
.post('/upload', bodyParser.json(), function (req, res) {
    // console.log("calling mkdir")    
    var dir = './public/uploads/';
    var form = new formidable.IncomingForm();


    form.parse(req, function (err, fields, files) {
        let chosenKeyword = fields.requestedIndexWord;
        let dir = __dirname + "/public/uploads/" + chosenKeyword;

        if (!fs.existsSync(dir)) {
            fs.mkdir(dir, { recursive: true }, (err) => {
                if (err) { 
                    console.log(err)
                    res.write(err);
                    res.end();
                } else {
                    var oldpath = files.filetoupload.path;
                    var newpath = dir + files.filetoupload.name;
                    fs.rename(oldpath, newpath, function (err) {
                        if (err) throw err;
                        res.write('File uploaded and moved!');
                        res.end();
                    });
                }
            });
        } else {
            var oldpath = files.filetoupload.path;
            var newpath = dir + "/" + files.filetoupload.name;
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                res.write('File uploaded and moved!');
                res.end();
            });
        }
    })


})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
}); 
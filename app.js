const express = require('express')
const startup = require('./routes/functions/startup');
const paginationFunction = require('./routes/functions/paginationFunction');
const fs = require('fs')
const bodyParser = require('body-parser')
var formidable = require('formidable');

let dataObject = {};


const app = express();
const port = 3000;
var ip = require('ip')
let ipAddress = ip.address()

app.set('port', port);

app.use(express.urlencoded());
app.use(express.json());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

const getAllParamsroutes = require('./routes/express routes/getAllParams');
const searchroutes = require('./routes/express routes/search');

//  Connect all our routes to our application
app.use('/tester', getAllParamsroutes);
app.use('/getAllParams', getAllParamsroutes);
app.use('/postSearch', searchroutes);
app.use('/static', express.static('public/staticSite', {
    extensions: ['html', 'htm'],
}));

app.listen(port, () => {
    console.log(`Example app listening on port ${ipAddress + port}!`)
}); 

app.listen(3000, ipAddress)

app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

refreshDO(100)

//Delete databases, no security - not necessary while this is a local app. 
app    
.get('/delete/:database/', (req, res) => {
        const reqDatabase = req.param("database");
        let folder = reqDatabase.split("-")[0]
        let file = reqDatabase.split("-")[1]

        if (dataObject[reqDatabase]) {
            fs.unlink("./public/uploads/" + folder + "/" + file + ".csv", (err) => {
                if (err) {
                    console.log("failed to delete local file: " + err);
                    res.send("failed to delete local file: " + err);
                } else {
                    refreshDO(1)
                    res.send('successfully deleted local file ' + file);
                }
            });
        } else {
            refreshDO(1)
            res.send("database does not exist")
        }
    });

//lookup based on keys, return as Obj
app.get('/:database/:indexID/', (req, res) => {
    const reqDatabase = req.param("database");
    let indexID = req.param("indexID").toLowerCase();
    indexID = indexID.split(",");
    let chosenDatabase = dataObject[reqDatabase];
    if (chosenDatabase["error"] == true) {
        let error = dataObject[reqDatabase]
        res.send(error)
    }
    let returnObj = []
    if (chosenDatabase && chosenDatabase["headers"]) {
        returnObj.push(chosenDatabase["headers"])
    }
    if(indexID[0] == "all"){
        let keys = Object.keys(chosenDatabase)
        keys.forEach((element,index) => {
            if(index < 50000){
            returnObj.push(chosenDatabase[element])
            }
        });
    }else{
    indexID.forEach(element => {
        if (chosenDatabase) {
            if (chosenDatabase[element]) {
                returnObj.push(chosenDatabase[element])
            } else {
                returnObj.push(makeBlank(element, chosenDatabase["headers"]))
            }
        }
    });
    }

    res.send(returnObj)

    function makeBlank(id, headersArray) {
        let keyword = reqDatabase.split("-")[0];
        let returnObj = {};
        headersArray.forEach(element => {
            returnObj[element] = "entry not found"
        });
        returnObj[keyword] = id;
        return returnObj
    }

});

//Basic route returns db info - largely defunct.
app.get('/:database', (req, res) => {
    let reqDatabase = req.param("database");
    let availableKeys = Object.keys(dataObject)
    //if database exists
    if (Object.keys(dataObject).includes(reqDatabase)) {
        let availableKeys = Object.keys(dataObject[reqDatabase])
        res.send("Available keys in this database include:"  +  availableKeys)
    } else {
        //send list of databases
        if (reqDatabase == "getDatabaseNames") {
            res.send({
                "Available Databases include": availableKeys
            })
        } else {
            res.status(400).send({
                "Error Message": "Database not found - try localhost:" + port + "/getDatabaseNames"
            })
        }
    }
});

app.use('/', express.static('public/staticSite', {
    extensions: ['html', 'htm'],
}));

// .get('/', (req, res) => {
//     // res.send(dataObject)
//     res.status(400).send({
//         "Error Message": "Database not selected - try localhost:"+port+"/getDatabaseNames"
//     });
// });

app // accepts new files for the db
    .post('/upload', bodyParser.json(), function (req, res) {
        // console.log("calling mkdir")    
        var dir = './public/uploads/';
        var form = new formidable.IncomingForm();


        form.parse(req, function (err, fields, files) {
            let chosenKeyword = fields.requestedIndexWord;
            let dir = __dirname + "/public/uploads/" + chosenKeyword;

            if (!fs.existsSync(dir)) { //if directory doesn't exist make it
                fs.mkdir(dir, { recursive: true }, (err) => {
                    if (err) {
                        console.log(err)
                        res.write(err);
                        res.end();
                    } else {
                        var oldpath = files.filetoupload.path;
                        var newpath = dir + "/" + files.filetoupload.name;
                        try {
                            fs.rename(oldpath, newpath, function (err) {
                                res.write('File uploaded and moved!');
                                res.end();
                                refreshDO(1)
                            });
                        } catch (err) {
                            res.send(err)
                        }

                    }
                });
            } else {
                var oldpath = files.filetoupload.path;
                var newpath = dir + "/" + files.filetoupload.name;

                fs.rename(oldpath, newpath, function (err) {
                    if (err) {
                        res.send('File upload failed - you just deleted that file! Rename the file or Restart the app to upload it again <br>' + err)

                    } else {
                        res.write('File uploaded and moved!');
                        res.end();
                        refreshDO(1)
                    }
                });

            }
        })


    })


//function that updates the dataObject containing all db info.
function refreshDO(time) {
    setTimeout(() => {
        dataObject = {};
        app.set('dataObject', dataObject);
        startup.startup().then(
            function (responseStartup) {
                dataObject = responseStartup
                app.set('dataObject', dataObject);

            });
    }, time);
}


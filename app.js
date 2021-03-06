const express = require('express')
const startup = require('./routes/functions/startup');
const paginationFunction = require('./routes/functions/paginationFunction');
const fs = require('fs')
const bodyParser = require('body-parser')
var formidable = require('formidable');
const open = require('open')

let dataObject = {};


const app = express();

// use port 3000 unless there exists a preconfigured port
let port = process.env.PORT || 3000;

app.use(express.urlencoded());
app.use(express.json());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

console.log("trying port " + port)
app.listen(port, () => {
    console.log("App listening on port " + port)
});


const getAllParamsroutes = require('./routes/express routes/getAllParams');
const searchroutes = require('./routes/express routes/search');

//  Connect all our routes to our application
app.use('/tester', getAllParamsroutes);
app.use('/getAllParams', getAllParamsroutes);
app.use('/postSearch', searchroutes);
app.use('/static', express.static('public/staticSite', {
    extensions: ['html', 'htm'],
}));

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
                    delete dataObject[reqDatabase];

                    app.set('dataObject', dataObject);
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
    if (indexID[0] == "all") {
        let keys = Object.keys(chosenDatabase)
        keys.forEach((element, index) => {
            if (index < 50000) {
                returnObj.push(chosenDatabase[element])
            }
        });
    } else {
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
        res.send("Available keys in this database include:" + availableKeys)
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



app // accepts new files for the db
    .post('/upload', bodyParser.json(), function (req, res) {
        // console.log("calling mkdir")    
        var dir = './public/uploads/';
        var form = new formidable.IncomingForm();


        form.parse(req, function (err, fields, files) {
            let chosenKeyword = fields.requestedIndexWord;
            let dir = __dirname + "/public/uploads/" + chosenKeyword;
            let oldpath = files.filetoupload.path;
            let newpath = dir + "/" + files.filetoupload.name;
            let name = files.filetoupload.name;
            let backURL = req.header('Referer') || '/';


            if (!fs.existsSync(dir)) { //if directory doesn't exist make it
                fs.mkdir(dir, { recursive: true }, (err) => {
                    if (err) {
                        console.log(err)
                        res.write(err);
                        res.end();
                    } else {
                        try {
                            uploadFile(oldpath,newpath,chosenKeyword,name,backURL,1)
                        } catch (err) {
                            res.send(err)
                        }
                    }
                });
            } else {
                uploadFile(oldpath,newpath,chosenKeyword,name,backURL,1)
            }
        })

        function uploadFile(oldpath,newpath,chosenKeyword,name,backURL,index){
            //if file exists - delete
            // if (fs.existsSync(newpath)){
            //     fs.unlinkSync(newpath);
            //      console.log("\nFile ",newpath," is deleted")
            // }


            //upload new file
            fs.rename(oldpath, newpath, function (err) {
                if(index == 1){res.setHeader('Content-type','text/html')}
                if (err) {
                    res.write('<h1>File/Keyword pair already exist. Renaming file to'+ name.replace(".csv","_1.csv")  + '"</h1>')
                    if(index < 8){
                    index++;
                    newpath = newpath.replace(".csv","_1.csv");
                    name = name.replace(".csv","_1.csv");
                    uploadFile(oldpath,newpath,chosenKeyword,name,backURL,index)
                    }else{
                    res.write('   Upload attempts failed due to  ', err)
                    }
                } else {

                    
                    let returnJson = {}
                    returnJson["Response"] = 'File uploaded and moved! Beginning Parse  -- ';
                    returnJson["Requested Keyword"] = chosenKeyword;
                    returnJson["Provided File"] = name;
                    returnJson["Return Link"] = backURL;

                    res.write("<h3>File uploaded and moved! Beginning Parse  -- </h3>")
                    res.write('<h3>Chosen Keyword: '+chosenKeyword+'</h3>');
                    res.write('<h3>Provided File: ' + name + '</h3>');
                    res.write('<h3>Return Link: <a href="'+ backURL+'">Return to previous page</a></h3>');

                    refreshDO(1)
                }
            });
        }


    })


//function that updates the dataObject containing all db info.
function refreshDO(time) {
    let firstLaunch = false;
    setTimeout(() => {
        dataObject = {};
        app.set('dataObject', dataObject);
        if (time === 100) { firstLaunch = true }
        startup.startup(firstLaunch).then(
            function (responseStartup) {
                dataObject = responseStartup;
                app.set('dataObject', dataObject);
                if (time === 100) {
                    console.log("Finished Parsing your databases, launching website. Parsed databases include:  ", Object.keys(responseStartup))
                    open('http://localhost:' + port);
                }
            });
    }, time);
}


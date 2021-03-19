//This route accepts a post request with a file and parses it based on 
    // Chosen keyword field
    // File

    //It will rename the file and create a directory for it, that we can then interpret for use in making a DataObject

var express = require('express'),
router = express.Router();
const bodyParser = require('body-parser')

//Logic
    //If no uploads directory - make one
    //rename the uploaded file based on the given form values
    //place in the directory
    
    router
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

   
  module.exports = router;



//takes in a string of requested IndexIDs and a chosen object database, and returns a filtered version 
// splits lists at & signs
function filterDBforID (db,id,reqDatabase){
const parseDB = require('./parseDB');
const objOfError = parseDB.sendObjOfError(reqDatabase);

    if(id == "all"){
        console.log("filderDBforID, split id is all")
        return db
    }else{
        let splitId = id.split("&");
        let returnDb = {}

        // in case of multiple requests in the same string - split into array
        if(splitId && splitId.length >= 1){

            splitId.forEach(element => {
                // if index id exists add to return object
                if(db[element]){
                 returnDb[element] = db[element]
                    }else{
                //if index id does not exist add "not found" object for the given key
                returnDb[element] = objOfError
            }
        });
        }

        
        return returnDb
    }
    
}



module.exports = {filterDBforID }
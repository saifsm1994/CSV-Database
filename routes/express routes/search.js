var express = require('express')
var router = express.Router()
var ip = require('ip')
const bodyParser = require('body-parser')

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  //   console.log('Time: ', Date.now())
  next()
})
// define the home page route
router.post('/', bodyParser.json(), function (req, res) {
  const request = req.body.value;
  let dataObject = req.app.get('dataObject');
  let port = req.app.get('port');

  //Inputs 

  //pagination - partial (1k) or full (all results - using the number 5k as a stand in)
  //page - if partial
  let pagination = 1000; // req.body.pagination
  let page = request.page;// req.body.page
  const reqDatabase = request.database; // name of the requested database
  let chosenDatabase = dataObject[reqDatabase]; //actual requested database object
  let headers = chosenDatabase["headers"];
  let chosenDatabaseKeys;
  if (typeof chosenDatabase == "object") { chosenDatabaseKeys = Object.keys(chosenDatabase) } else { chosenDatabaseKeys == [""] }
  // console.log("chosenDatabaseKeys",chosenDatabaseKeys)

  // 1 search cat -> 1 array in combinations - search for each of these and append
  let searchCatArray = request.orSearchCat; //searchCat = array
  let searchCombinationsArray = request.orSearchCombinations;  //searchCombinations = array of arrays, length = searchCat.length, terms to look for in each search cat
  let searchType = request.searchType;
  let caseSensitive = request.caseSensitive;

  // Input tests
  if (request.pagination && Number.isInteger(Number.parseInt(request.pagination))) { pagination = Number.parseInt(request.pagination) }
  if (request.page && Number.isInteger(Number.parseInt(request.page))) { page = Number.parseInt(request.page) }
  if (chosenDatabase) { } else { res.send("database not found - requested db was " + reqDatabase) }
  if (!Array.isArray(searchCatArray)) { searchCatArray = [searchCatArray] }
  if (!Array.isArray(searchCombinationsArray)) { searchCombinationsArray = [searchCombinationsArray.split(",")] }
  if (searchType == false) {
    console.log("searchType is ", searchType)
    searchType = "loose"
    console.log("searchType is now ", searchType)
  } else {
    searchType = "exact"
    console.log("searchType is ", searchType)

  }



  // create temporary object holders
  let returnObj = {};
  let returnObjTemp = {};
  let returnObjTemp2 = {};

  //Basic search function adds all matches
  searchCatArray.forEach((cat, index) => { // for every category we want to search in
    searchCombinationsArray[index].forEach((searchString, index2) => { // for every term to look for within those cats
      // console.log("searchCombinationsArray",cat,searchString)

      if (searchString == "") { } else { // ignore if no search term

        searchString = searchString.replace(new RegExp(/\"/, "gmi"), '')

        if (caseSensitive && typeof searchString == "string") { // add future element for non-case sensitivity
          searchString = searchString.toLowerCase();
        } // case insentive matches

        chosenDatabaseKeys.forEach((indexID, index3) => { // all indexIDs in database
          let entry = chosenDatabase[indexID];

          if (indexID && entry["mult"]) { // handle if duplicates exist
            handleDuplicateSearches(entry);

            function handleDuplicateSearches(entry) { // takes array of arrays and searches individually

              let entryKeys = Object.keys(entry);
              entryKeys.forEach(duplicateKey => { // for each duplicate stored
                if (duplicateKey && duplicateKey != "mult") { // except for the indicator that duplicates exist

                  let valueToSearch = "";
                  if (entry[duplicateKey][cat]) {
                    valueToSearch = JSON.stringify(entry[duplicateKey][cat]).replace(new RegExp(/\"/, "gmi"), '')
                  }

                  if (caseSensitive && typeof valueToSearch == "string") { // add future element for non-case sensitivity
                    valueToSearch = valueToSearch.toLowerCase();
                  } // case insentive matches

                  if (entry[duplicateKey][cat] && valueToSearch.indexOf(searchString) != -1) { // || entry[duplicateKey][cat] && searchString.indexOf(valueToSearch) != -1

                    if (searchType && searchType != "exact") { // if loose search type add if search string is present in or contains value we're checking against
                      returnObjTemp[indexID] = entry
                    } else {//if exact search type, make sure there's a perfect match

                      if (valueToSearch.replace(new RegExp(/\"/, "gmi"), '') == searchString.replace(new RegExp(/\"/, "gmi"), '')) {
                        returnObjTemp[indexID] = entry // catches quote type issues
                      }
                    }
                  }
                }
              })
            }


          } else { // if not a duplicate

            let valueToSearch = "";
            if (entry[cat]) {
              valueToSearch = JSON.stringify(entry[cat]).replace(new RegExp(/\"/, "gmi"), '');
              // console.log("valueToSearch",valueToSearch);
            }

            if (caseSensitive && typeof valueToSearch == "string") { // add future element for non-case sensitivity
              valueToSearch = valueToSearch.toLowerCase();
              // console.log("valueToSearch", valueToSearch);

            } // case insentive matches

            if (valueToSearch == "7795") {
              console.log("valueToSearch", valueToSearch)
              console.log("searchString", searchString)
            }

            if (entry[cat] && valueToSearch.indexOf(searchString) != -1) { // || entry[cat] && searchString.indexOf(valueToSearch) != -1
              if (searchType && searchType != "exact") { // if not exact add if loose match, see above for details
                returnObjTemp[indexID] = entry;
              } else {
                if (valueToSearch == searchString) {
                  returnObjTemp[indexID] = entry;
                }
              }
            }
          }
        });

      }
    });
  });



  //mustInclude = single array of terms that must show up in indexOf
  //mustExclude = single arrayof terms that must NOT show up in indexOf
  let includeArr = request.mustInclude.split(",");
  let includeArrlen = includeArr.length;
  let excludeArr = request.mustExclude.split(",");
  let excludeArrlen = excludeArr.length;


  let returnObjKeys1 = Object.keys(returnObjTemp)
  // console.log("returnObjKeys1", returnObjKeys1)


  if (includeArrlen && includeArr && includeArrlen > 0 && includeArr[0] != "") {
    includeArr.forEach((mustIncludeString, index) => {
      try {
        let includeReg = new RegExp(mustIncludeString, 'gmi')
        if (index == 0) {
          returnObjTemp2 = includeSearch(returnObjKeys1, returnObjTemp, includeReg)
        } else {
          returnObjTemp2 = includeSearch(Object.keys(returnObjTemp2), returnObjTemp2, includeReg)
        }
      } catch{
        console.log("regex search failed in determining must include values, defaulting to indexOf search for keyword: " + mustIncludeString)
        if (index == 0) {
          returnObjTemp2 = includeSearch2(returnObjKeys1, returnObjTemp, mustIncludeString)
        } else {
          returnObjTemp2 = includeSearch2(Object.keys(returnObjTemp2), returnObjTemp2, mustIncludeString)
        }
      }
    });
  } else {
    // console.log("no inclusion list")
    returnObjTemp2 = returnObjTemp;
  }

  if (excludeArrlen > 0 && excludeArr[0] != "") {
    excludeArr.forEach(mustExcludeString => {
      try {
        let excludeReg = new RegExp(mustExcludeString, 'gmi')
        returnObjTemp2 = excludeSearch(Object.keys(returnObjTemp2), returnObjTemp2, excludeReg)
      } catch{
        console.log("regex search failed in determining must exclude values, defaulting to indexOf search for keyword: " + mustIncludeString)
        returnObjTemp2 = excludeSearch2(Object.keys(returnObjTemp2), returnObjTemp2, excludeReg)
      }
    });
    returnObj = returnObjTemp2;
  } else {
    returnObj = returnObjTemp2;
  }

  //if invalid regex call this
  function includeSearch(arrayOfKeys, ObjOfIncludedValues, regex) { //adds regex matches to obj
    let retunObj = {}
    // console.log("arrayOfKeys",arrayOfKeys)
    arrayOfKeys.forEach(includedKey => {
      let stringVal = makeSearchableString(ObjOfIncludedValues[includedKey]);
      if (stringVal.match(regex)) {
        retunObj[includedKey] = ObjOfIncludedValues[includedKey];
      } else {
      }
    })
    return retunObj
  }

  function includeSearch2(arrayOfKeys, ObjOfIncludedValues, searchString) { //adds regex matches to obj
    let retunObj = {}
    // console.log("arrayOfKeys",arrayOfKeys)
    arrayOfKeys.forEach(includedKey => {
      let stringVal = makeSearchableString(ObjOfIncludedValues[includedKey]);
      if (stringVal.indexOf(searchString) != -1) {
        retunObj[includedKey] = ObjOfIncludedValues[includedKey];
      } else {
      }
    })
    return retunObj
  }


  function excludeSearch(arrayOfKeys, ObjOfIncludedValues, regex) { // deletes entries in regex from obj
    arrayOfKeys.forEach(includedKey => {
      let stringVal = makeSearchableString(ObjOfIncludedValues[includedKey]);
      if (stringVal.match(regex)) {
        delete ObjOfIncludedValues[includedKey];
      } else {
      }
    })
    return ObjOfIncludedValues
  }
  function excludeSearch2(arrayOfKeys, ObjOfIncludedValues, searchString) { // deletes entries in regex from obj
    arrayOfKeys.forEach(includedKey => {
      let stringVal = makeSearchableString(ObjOfIncludedValues[includedKey]);
      if (stringVal.indexOf(searchString) != -1) {
        delete ObjOfIncludedValues[includedKey];
      } else {
      }
    })
    return ObjOfIncludedValues
  }


  let returnObjKeys = Object.keys(returnObj);
  let returnObjKeyslen = returnObjKeys.length;
  let responsePaginationObj = {}

  //set pagination limits
  let pages = Math.ceil(returnObjKeyslen / pagination)
  if (page > pages || page == 0) { page = 1 }
  let paginationStart = (page - 1) * pagination;
  let paginationEnd = pagination * page;
  if (paginationEnd > returnObjKeyslen) { paginationEnd = returnObjKeyslen }


  if (paginationEnd > returnObjKeys.length) {
    paginationEnd = returnObjKeys.length;
  }

  //object that returns messages for internal use
  let internalMessages = {};
  internalMessages.len = returnObjKeys.length;
  internalMessages.headers = headers;
  responsePaginationObj.internalMessages = internalMessages

  if (pagination == 5000) {
    pagination = "All";
    responsePaginationObj = returnObj;
  } else {
    returnObjKeys.forEach((element, index) => {
      if (index >= paginationStart && index <= paginationEnd) {
        responsePaginationObj[element] = returnObj[element];
      }
    });

  }

  // console.log("responsePaginationObj", responsePaginationObj)
  res.send(responsePaginationObj)


  function makeBlank(id, headersArray) {
    let keyword = reqDatabase.split("-")[0];
    let returnObj = {};
    headersArray.forEach(element => {
      returnObj[element] = "entry not found"
    });
    returnObj[keyword] = id;
    return returnObj
  }


  function makeSearchableString(obj) { // returns obj as string without keys
    let stringer = ""
    let keys = Object.keys(obj);
    keys.forEach(element => {
      if (typeof obj[element] === "object") {
        let keys2 = Object.keys(obj[element]);
        keys2.forEach(element2 => {
          if (typeof obj[element][element2] === "object") {
            stringer += JSON.stringify(obj[element][element2])
          } else {
            stringer += obj[element][element2]
          }
        });
      } else {
        stringer += obj[element]
      }
    });
    return stringer
  }



})



module.exports = router
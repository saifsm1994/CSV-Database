function mustIncludeOrExclude(terms,obj,includeOrExclude){
    // takes csv string , obj
    let returnObj = {};
    let termsArray = terms.split(",");
    let count = termsArray.length;

    if(includeOrExclude){
        count = count;
    }else{
        count = 0;
        }


    Object.keys(obj).forEach(key => {
        let tempArr = [];
        termsArray.forEach(term => {
            // console.log("returnObj",obj[key])

            if(JSON.stringify(obj[key]).toLowerCase().indexOf(term.toLowerCase().trim()) != -1){
                tempArr.push(obj[key]);
            }
        });
        if(count == tempArr.length){
            returnObj[key] = obj[key]
        }
        
    });

    return returnObj

}

function singleSearch(orSearchCat,orSearchCombinations,searchType,returnObj,chosenDatabaseKeys,chosenDatabase){
    // formats: string, array, string, obj, obj

    let cat = orSearchCat;
    let term = orSearchCombinations
    let type = searchType;
    // let returnObj = returnObj;
    // let chosenDatabaseKeys = chosenDatabaseKeys;



    if(type == "exact"){
        term.forEach(searchTerm => {
            // console.log("searchTerm",searchTerm)
            chosenDatabaseKeys.forEach(indexId => {
                let valueEntry = chosenDatabase[indexId];
                let value = valueEntry[cat];
                value = value.replace("/(\|\|\s\add\.\svalue\s\d\:)+/gim","|").split("|")
                value.forEach(valueElement => {
                    if(valueElement.trim().toLowerCase() == searchTerm.trim().toLowerCase()){
                        returnObj[indexId] = valueEntry
                    }else{
                    }
                });
            });
        });
     }

     if(type == "loose"){
        term.forEach(searchTerm => {
            // console.log("searchTerm looseSearch",searchTerm)
            chosenDatabaseKeys.forEach(indexId => {
                let valueEntry = chosenDatabase[indexId];
                let value = valueEntry[cat];
            if(value.trim().toLowerCase().includes(searchTerm.trim().toLowerCase()) && searchTerm.length > 1  || value.length >= 1 && searchTerm.trim().toLowerCase().includes(value.trim().toLowerCase() )){
                returnObj[indexId] = valueEntry
                // console.log("adding to Return:\n " + value.trim().toLowerCase() +"\n == \n" + searchTerm.trim().toLowerCase())
            }
            });
        });
     }

     return returnObj

}


module.exports = { singleSearch, mustIncludeOrExclude }




function paginationFunction(Obj1,pagination,page){
    return new Promise(function(resolve, reject) {
        let errorResponse = {error: "invalid pagination/page"};
        let response = {};
        let pagination2 = parseInt(pagination);
        let page2 = parseInt(page);

        console.log("requested pagination - ", pagination2)
        console.log("requested page - ", page2)


        
        if(Number.isInteger(page2) && Number.isInteger(pagination2)){
            let keys= Object.keys(Obj1);
            let i = (page2 - 1)*pagination2;
            if(i < 0){i = 0}

            keys.forEach((element,index) => {
                // console.log("pagination - i = " + i + "index = " + index)
                if(index >= i && index < page2*pagination2){
                    response[element] = Obj1[element]
                    response[element]["Entry"] = index+1
                }
                //i++
                                
            });
            resolve(response)


        }else{
            console.log("Number.isInteger(page) && Number.isInteger(pagination)", Number.isInteger(page2),Number.isInteger(pagination2),page2,pagination)
            resolve(errorResponse)
        }
    })
}

function paginationCounter(chosenDatabase){
    let paginationOptions = {}
    let arrayOfPaginations=[25,50,100,250,500,1000]
    arrayOfPaginations.forEach(element => {
        paginationOptions[element] = [element,Math.ceil(Object.keys(chosenDatabase).length/element)]
    });

    return paginationOptions 
}


function headersFinder(chosenDatabase){
    if(chosenDatabase && Object.keys(chosenDatabase).length > 1){
    let availableIDs = Object.keys(chosenDatabase);
    console.log("headersFinder",availableIDs)
    let listOfHeaders = Object.keys(chosenDatabase[availableIDs[0]]);
   
    return listOfHeaders
}else{
    return {"error": "no headers found"}
    }
}






module.exports = {paginationFunction, paginationCounter,headersFinder}
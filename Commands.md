#Basic routes and commands explained


There are 3 basic roues




GET

######/:databaseName/lookup/:indexID OR /:databaseName/lookup/:indexID&indexID&indexID...
returns an Object with keys being every chosen indexID. Only limits are based on Get request parameter limits.
an indexID of "all" returns all values - but once again this is not recommended as large databases can crash your tab


######/:database/lookup/:indexID/:pagination/:page
needs a pagination value of 25,50,100,250,500,1000 depending on how many entries you want
a page value is also required depending on which page of results you want
lookup



POST
site /:database/postSearch'
A post request where database is the name of the database you are interested in.
Takes the following arguments
req.body.pagination = single value of 25, 50, 100, 250, 500 or 1000
req.body.page = single value determining page number
req.body.orSearchCat = single value or array of values indicating which categories to search in
req.body.orSearchCombinations = single value or array of values of what to search for. If in the same category comma seperated lists can be used. E.g. : cat 1 combinations a,b,c searches for a b and c seperately and appends results
req.body.searchType = loose or exact. Exact requires a perfect match barring case, loose is fine with a partial match via the .includes function either way
req.body.mustInclude = single value, csv of values or array of values that must show up in each row
req.body.mustExclude = single value, csv of values or array of values that must NOT show up in each row

It returns the following values in an object
"result": response array of requested values, 
"paginationOptions": array containing arrays detailing possible pagination choices and pagecount involved, 
"listOfHeaders":all headers/keys


Other Routes
GET

######/info
Returns headers, pagination options and number of keys

######/getDatabaseNames
Returns a list of all valid databases currently available. My take a minute to add larger datasets after running.


######/:databaseName/listOfHeaders OR /:databaseName/keywords
Returns a Object with the key "listOfHeaders" which lists all headers in the given database/csv

######/:databaseName/availableIDs 
Returns a Object with the key "availableIDs" which lists all available Index IDs in the given database/csv



Errors (GET)
######/ or /database
Accesses the root function, returns a "not found" error and directs the user to /getDatabaseNames for a list of database names


Non-recommended (GET)
######/:databaseName
Using a database from /getDatabaseNames. Returns an object with the entire database you've chosen. Not a good idea to  access this page for extremely large databases as it will crash your tab.







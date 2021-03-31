# csv-database

csv-database is a simple NodeJS application for turning any CSV file into a live searchable local website.

Excel often has issues with larger spreadsheets which are >15,000+ lines long and not everyone can directly manipulate such files. The goal of this tool is to greatly simplify the process of searching through extremely large spreadsheets.

## Installation

### Complete Beginners Installation Guide

I will be assuming users have no knowledge of web development applications like nodejs. I have not tested this application on Linux or MacOS but I imagine installation will be relatively similar

Installation is relatively simple, but we need a few softwares to be installed. These are 

* NodeJS
* Yarn

Installing these can be simplified by installing them through a package manager per the next few steps

* Install package manager chocolatey per the instructions here  
[https://chocolatey.org/install](https://chocolatey.org/install)
* Once it finishes installing run "terminal" or "Command Prompt as Admin"
* Use the following command to install nodejs and yarn

```bash
choco install nodejs yarn -y
```

* Once these have finished installing download all files in this directory and place them in a folder
* Open the chosen folder and start the terminal there by following the instructions [here](https://www.groovypost.com/howto/open-command-window-terminal-window-specific-folder-windows-mac-linux/)
* Once opened, use the following command to install the package dependencies

```bash
yarn install
```

* Once this finishes we can start the server with the command 

```bash
yarn start
```

* Closing the terminal window will cause the application to stop, starting it again can be done by opening the terminal  in the given folder again and using the above "yarn start" command

Server will be available at [http://localhost:3000/](http://localhost:3000/)


### Regular Installation Guide

Download or Clone entire repository, cd into repo and run

```bash
yarn install
```

OR 

```bash
npm install
```

Service can be started with 

```bash
npm start
```

OR 

```bash
yarn start
```

Server will be available at [http://localhost:3000/](http://localhost:3000/)


## Usage:

### Starting the server
Please see installation for more details on how to get things set up, but once you are ready to go we can start the server by:
1. Going to the directory in which we have stored the files for this application
2. Opening terminal (or Powershell or Command Prompt) within that directory 
3. Typing the command
```bash
yarn start
```
4. Navigating to [http://localhost:3000/static](http://localhost:3000/static)

### Preparing the sheet
1. Save your spreadsheet as a CSV File, make sure no columns exist that don't have headers.
1. Ensure there is a header term that has a value present in every row. These will be used to lookup the entries in your spreadsheet in the lookup page. This will be called our 'keyword'
     1. Ideally these would be unique. An example of this can be a unique user identifier, the name of a city, or even a number. 
     1. If no identifier is present the keyword **"no key found"** will be assigned to the given row
     1. **Example:** Using the keyword "User1" will return any rows with the value "User1" in the chosen keyword field.

1.  Once  this is done we can proceed to the next step

### Uploading the Database
1. Proceed to  [http://localhost:3000/static/upload](http://localhost:3000/static/upload)
2. Click on Choose File and select your chosen CSV File
3. Type your keyword into the input box exactly as it is in your column header
4. Click upload
5. Once the upload succeeds you can proceed to [http://localhost:3000/Static/Lookup](http://localhost:3000/Static/Lookup), Once the database finishes parsing (.1 - 3 minutes) refreshing this page should show your new database in the "Database select" dropdown

### Looking up values based on their unique identifier

1. Proceed to  [http://localhost:3000/static/lookup](http://localhost:3000/static/lookup)
2. Select a database from the dropdown, you may need to reload the page after a minute or two if your dataset is particularly large
3. Type in either a comma separated list of identifiers to lookup in the "Comma Separated Search Terms" field, or copy and paste several rows across a single column into the "Column Separated Search Terms" field
4. Press Search
5. (Optional) Uncheck "Merge Duplicates" if you would like for multiple rows sharing the same keyword to appear separately 


### Searching the database

1. Proceed to  [http://localhost:3000/static/search](http://localhost:3000/static/search)
2. Select a database from the dropdown, you may need to reload the page after a minute or two if your dataset is particularly large
3. Select a category/header you'd like to search through
4. Type in your search terms, separate with a comma if there are multiple search terms in a single header
5. All responses with any matching values will be returned
6. Use the "Must posess (Case insensitive)" field for any terms that MUST appear in each row
7. Use the "Must exclude (Case insensitive)" field for any terms that MUST NOT appear in each row
8. Changing number of entries per page will require pressing the search button again to reload results. The default is set to 500 as things begin to slow down slightly if more results are loaded on a single page.

### Deleting a database

1. Proceed to  [http://localhost:3000/static/delete](http://localhost:3000/static/delete)
2. Delete the database you want to remove
3. You cannot reupload a database with the same name and keyword again without restarting the application
4. If you are unable to delete the database through this page, please navigate to the public/uploads/keyword folder and manually delete the file before restarting the application.




## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

Readme written using https://www.makeareadme.com/

Packages used include
* body-parser
* exceljs
* express
* fast-csv
* formidable
* fs
* ip
* nodemon
* path
* querystring
* w2ui

## License
[MIT](https://choosealicense.com/licenses/mit/)
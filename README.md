**What is `CSV-Database`?**

CSV-Database is a free software solution to convert large spreadsheets into instantly accessible online portals for your local network. It has been designed to allow almost anyone to use without without any need to know programming languages or data manipulation tools and can work with extremely large spreadsheets of well over 100k rows of data. It does require the use of  [NodeJS](https://nodejs.org/en/) but should work on Windows, Mac or Linux machines perfectly.

--

**Repo Note**: The `main` branch is an *in development* version of CSV-Database. This may be substantially different from the latest [releases of CSV-Database](https://github.com/saifsm1994/CSV-Database/releases).

---



# CSV-Database

[CSV-Database `main`](https://github.com/saifsm1994/CSV-Database/tree/main)

CSV-Database transforms CSV spreadsheets into live searchable online portals. Note: A CSV is a file format all major spreadsheet softwares can save individual spreadsheet tabs or pages as.

-   [Why CSV-Database?](#why-CSV-Database)
-   [Using CSV-Database](#using-CSV-Database)
-   [Importing your CSV](#importing-your-CSV)
-   [Available Pages](#pages)
-   [Known issues](#known-issues)
-   [Contributing](#contributing)
-   [Packages Used](#packages-used)

## Why CSV-Database?

If you’ve ever tried to work with a enourmous spreadsheet with over a few thousand rows you are probably familiair with just how painful filtering searching through them for data can be - especially on older hardware.
CSV-Database allows you to instantly turn that spreadsheet into a locally accessible website you can instantly search for the data you require - and one which can run on even the weakest of hardware.

**Caveat**: CSV-Database only works with CSV files, Excel spreadsheets must be opened and each individual page must be exported or saved as a CSV file. All columns with data must also posess a header.

**Security:**: CSV-Database is a local program that will run on your local machine. It should not touch the wider internet unless you expressly set port-forwarding on your local network or run it on a publically acessible VPS. If you do allow it access to your local network (optional), however, it will be accessible by other devices on your network - not granting this access will limit it solely to the device it will be running on.

## Using CSV-Database

First, make sure you have a copy of NodeJS installed. You can [download NodeJS here](https://nodejs.org/en/).

* ### Windows
    1. Download this repo as a ZIP file from the download code button above or [the releases section](https://github.com/saifsm1994/CSV-Database/releases). 
    2. Unzip the whole thing and open terminal or powershell within the unzipped folder inside. This can be done by holding shift and right clicking before selecting 'Open PowerShell window here'.
    3. run the following command to install all package dependencies

      npm install

    4. Once finished run the following command to start the server
        
      npm start

    5. Open a browser and go to the URL http://127.0.0.1:3000/

  Closing CSV-Database: To close the program, just go back to the terminal or powershell window running the program and close it or press "Control-C" a few times - this may take a few seconds.

    <strong> Automatically starting CSV-Database</strong>

    To automatically start CSV-Database with your machine you can create a .bat file and drop a shortcut to it in your startup folder. 

    <strong> .bat creation: </strong>

    1. Create a new text file in the folder named start.txt
    2. Copy the path to the folder containing CSV-Database from file explorer
    3. Open the file
    4. Type in the following lines, replacing *path here* with the path you just copied

      cd *path here*
      npm start

    5. You should now have a file that looks something like this:

      cd C:/Users/UserName/Desktop/CSV-Database/
      npm start

    6. Choose 'Save As'
    7. Change type to 'All Files' and change the .txt at the end of the file name to .bat
    8. Save the file.
    9. Success - you should now be able to run this program by doubleclicking start.bat
    10. Drop a shortcut to this in your startup folder to automatically launch the program on logging in.

* ### Mac OS X
  The process for running this on MacOS should largely be the same as with Windows, except you will need to google how to open terminal from a specific folder for your particular version of OS X

* ### Other platforms (e.g. Linux)
    The process is very similar to the process for windows, except you have the option of running CSV-Database on other ports by sending the argument PORT=XXX from the command line.


## Importing your CSV
    1. Upon running CSV-Database you can proceed to the [uploads page](http://127.0.0.1:3000/Static/Upload) and select your chosen CSV file
    2. The form will also ask you for a chosen 'Keyword' - the keyword should be a header from your CSV file that is ideally unique to each row. It will be the ID you use to instantly lookup specific rows from the CSV file.
    3. If there is no such Keyword present in your file you can choose any header for a column without any symbols e.g. FirstName or add a new blank column with the header 'No Keyword' and use that as your keyword and things should work fine, except the Lookup page should be significantly less useful.
    4. NOTE: In such a case please be sure to always unselect the 'Merge duplicates' option when searching or looking up values

## Pages

There are 4 main pages in CSV Database. These are
    1. The Upload Page - This page allows you to upload new CSV files and select their respective keywords
    2. The Delete Page - This page lists all loaded CSV databases and allow you to delete them
    3. The Lookup Page - This page allows you to lookup rows based on the values listed in their Keyword Columns directly (e.g. if your keyword is First Name, it would let you search for all users with the name John instantly)
    4. The Search Page - This page allows you to search through any column of your CSV file and return all exact or partial matches for a given search string. It also allows you to specify terms that MUST or MUST NOT appear in the returned rows (e.g. all rows with a name beginning with Jo in the First Name column, but only if their last name is not Smith)

## Known issues

I am actively working on this project, please feel free to post any bugs or feature requests [to the issues tab above](https://github.com/saifsm1994/CSV-Database/issues). Other issues you may run into include: 

* <a name='Eaddir'>**"EADDRINUSE"** </a>:
  If the application crashes with this error it indicates that another version of CSV-Database or some other application is currently running and using PORT 3000. Please either close that instance first or edit your app.js file and replace all instances of 3000 with some other port (e.g. 3020) - CSV-Database will then be accessible on http://127.0.0.1: + the chosen port

 * <a name='SearchTime'>My searches are taking a long time to run</a>
    The search page allows for multiple queries to be joined together, but each query is asked in sucession - resulting in a linear increase in time. E.g. Searching for John,James in a column with the keyword First Name results in two queries the first searching for all users named John and the second for all users named James before returning both. For extremely large 200k row  files this can mean a search with 10 or more queries may take 5-60 seconds depending on your machine's horsepower.

* <a name='slowDB'>My database takes a few minutes to appear in the search and upload pages after I start the server</a>
    CSV Databases will not load until they have been fully loaded and are searchable. This can take a few minutes depending on the power of your computer. An old laptop should be able to load most CSV files in less than a second per thousand rows, but a Raspberry Pi Zero may need 2-3 seconds per 1000 rows.

## Contributing

I greatly welcome any help or advice regarding thi project. Please feel free to reach out directly or through the issues tab with any suggestions, advice or feedback.

## Packages Used

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
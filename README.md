# Swedish Subsidy XML Generator

Contains a set of functions to help Otovistas convert csv files to xml file to help speed up applications for Swedish Subsidies.

CSVs must exported in the format defined in this [sheet](https://docs.google.com/spreadsheets/d/1XCjtUQzMaoFMhpGATTpNJotNPWbPyeft-PZiFOhU7Rk/edit#gid=0). Do not change the headers, as this will affect the xml output.

## Instructions

1. Clone the repository.
2. Run `yarn install`
3. Add the csv files to the folder `sources/`.
4. Run `node gront-stod-csv-to-xml <PATH_TO_GRONT_STOD_FILE_NAME>` to convert the gront stod csv file to xml. The resulting xml will be generated in the `documents/` folder.
5. Run `node rot-csv-to-xml <PATH_TO_ROT_FILE_NAME>` to convert the rot csv file to xml. The resulting xml will be generated in the `documents/` folder.


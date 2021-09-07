# json-to-excel-flow

## Requirements

Node.js
Python 3

## Getting started

### Node

Install Node requirements.
```
npm install
```

### Python

Install Python requirements.
```
python -m venv <path_to_venv_dir>/json-to-excel-flow
source <path_to_venv_dir>/json-to-excel-flow/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Where `<path_to_venv_dir>` is a directory where your Python virtual environments are stored. This could be anywhere in your filesystem, but it is recommended that it be outside of this project's root directory.

Once the scripts have been run and there is no further need of them, the virtual environment should be deactivated.

```
deactivate
```

## Running the scripts

The scripts here transform a Rapid Pro JSON export file into one or more 'topical' Excel spreadsheets, for the purpose of authoring the content and logic of flows, in a tabular format.

A Rapid Pro JSON export file may contain many flows, which can be grouped by topic. Those grouped flows are the basis of a single Excel spreadsheet, which would contain several sheets, one for each flow in the topic group.

### Create Excel rows

Takes a Rapid Pro JSON export and groups the flows within it according to a mapping configuration file. In addition, each flow within a group is transformed into a JSON format representing rows in a spreadsheet. A single JSON file is created for each topic group, as well as a 'catch-all' file for flows that could not be grouped.

```
node scripts/create_excel_rows.js <input_file> <mapping_file> <output_dir>
```

- `input_file` is the Rapid Pro JSON export.
- `mapping_file` describes how to group the flows in the input file.
- `output_dir` is the directory where the output JSON files will go.

### Create CSV files
```
node scripts/create_csv_files.js
```

### Create single Excel file
```
python scripts/create_single_excel.py
```

There is a JS version of the Python script above, but it is not yet ready to replace the original script.

Combine multiple CSV files into one Excel spreadsheet. Where `input_dir` is the path to a directory with the CSV files to be combined, and `output_file` is the path to the Excel spreadsheet that will be created.
```
node scripts/create_single_excel.js <input_dir> <output_file>
```

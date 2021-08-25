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

```
node scripts/create_excel_rows.js
node scripts/create_csv_files.js
python scripts/create_single_excel.py
```

Combine multiple CSV files into one Excel spreadsheet. Where `input_dir` is the path to a directory with the CSV files to be combined, and `output_file` is the path to the Excel spreadsheet that will be created.
```
node scripts/create_single_excel.js <input_dir> <output_file>
```

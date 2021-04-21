import os
import pandas as pd
import glob

path = '../examples/output/csv-files/flows_from_excel/'
all_files = glob.glob(os.path.join(path, "*.csv"))


writer = pd.ExcelWriter('../examples/output/csv-files/out.xlsx', engine='xlsxwriter')

for f in all_files:
    df = pd.read_csv(f)
    print(f)
    df.to_excel(writer, sheet_name=os.path.splitext(os.path.basename(f))[0], index=False)

writer.save()
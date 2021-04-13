
var fs = require('fs');
var path = require("path");
var converter = require("json-2-csv");

var input_path  = path.join(__dirname, "../examples/output/all_test_flows_rows.json");
var full_json_string = fs.readFileSync(input_path).toString();
var row_obj = JSON.parse(full_json_string);



const column_names = [ "row_id","type","from","condition","condition_var","condition_type","message_text","choice_1",
"choice_2","choice_3","choice_4","choice_5","choice_6","choice_7","choice_8","choice_9","choice_10","image","audio","video",
"_nodeId","save_name","no_response"];

async function outputFiles() {


        
        for (flow in row_obj) {
            console.log(flow)
            var curr_flow_rows = row_obj[flow];
            
            var curr_flow_csv = [];
            for (var r=0; r<curr_flow_rows.length; r++){
                var curr_json_row = curr_flow_rows[r];
               
                var csv_row = {};
                column_names.forEach(col =>{
                    if (curr_json_row.hasOwnProperty(col)){
                        csv_row[col] = curr_json_row[col];
                    }else{
                        csv_row[col] = null;
                    }
                })
                curr_flow_csv.push(csv_row);
            }
                  
            var output_path = path.join(__dirname, "../examples/output/csv-files/"+ flow + ".csv");



      
        /* converter.json2csv(rows, (err, csvString) => {
            fs.writeFileSync(output_path, csvString);
            //console.log("CSV " + flows_for_spreadsheet[N_file].name_of_file + " is written");
            console.log(output_path + " is written")
        }); */
        
        let csvString = await converter.json2csvAsync(curr_flow_csv);
        fs.writeFileSync(output_path, csvString);
        /*wrapperJson2Csv(output_path, rows).then((csv) => {
            console.log(output_path)
            fs.writeFile(output_path, csv, function (err, result) {
                if (err) console.log('error', err);
            }
            )
        }).catch((err) => { console.error(err) });*/

    }
}

outputFiles().then(() => {
    console.log("I outputted the files");
});



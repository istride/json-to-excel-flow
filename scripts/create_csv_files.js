
var fs = require('fs');
var path = require("path");
var converter = require("json-2-csv");

var input_path  = path.join(__dirname, "../examples/output/flows_from_excel_rows.json");
var full_json_string = fs.readFileSync(input_path).toString();
var row_obj = JSON.parse(full_json_string);



const column_names = [ "row_id","type","from","condition","condition_var","condition_type","save_name","message_text","choice_1",
"choice_2","choice_3","choice_4","choice_5","choice_6","choice_7","choice_8","choice_9","choice_10","image","audio","video",
"_nodeId","no_response"];

async function outputFiles() {


        var flow_names = [];
        for (flow in row_obj) {
            
            var curr_flow_rows = row_obj[flow];
            
            var curr_flow_csv = [];
            for (var r=0; r<curr_flow_rows.length; r++){
                var curr_json_row = curr_flow_rows[r];
               
                var csv_row = {};
                column_names.forEach(col =>{
                    if (curr_json_row.hasOwnProperty(col) ){
                        
                        if (Array.isArray(curr_json_row[col]) ){
                          
                            if (curr_json_row[col].every(function(v) { return v == null })){
                                csv_row[col] = ""
                            } else if(curr_json_row[col].length == 1){
                                csv_row[col] = curr_json_row[col][0];
                            } else{
                                csv_row[col] = curr_json_row[col];
                            }

                            
                        }else{
                            csv_row[col] = curr_json_row[col];
                        }
                        
                    }else{
                        csv_row[col] = "";
                    }
                })
                curr_flow_csv.push(csv_row);
            }

        
            const searchRegExp_1 = /\s-\s/g;
            const replaceWith_1 = '-';
            const searchRegExp_2 = /\s/g;
            const replaceWith_2 = '_';
            let flow_sheet_name = String(flow).replace(searchRegExp_1, replaceWith_1).replace(searchRegExp_2, replaceWith_2);
            if (flow_sheet_name.length >31){
                flow_sheet_name = flow_sheet_name.substring(0,31);
            }
       

            flow_names.push(flow_sheet_name);
            var output_path = path.join(__dirname, "../examples/output/csv-files/flows_from_excel/"+ flow_sheet_name + ".csv");



      
       
        
        let csvString = await converter.json2csvAsync(curr_flow_csv);
        fs.writeFileSync(output_path, csvString);
        

    }
    var content_csv = [];
    flow_names.forEach(name =>{
        let content_row = {};
        content_row.flow_type = "conversation";
        content_row.flow_name = name;
        content_row.status = "released";
        content_csv.push(content_row);
    })



    var output_path = path.join(__dirname, "../examples/output/csv-files/flows_from_excel/"+ "==content_list==.csv");
    let csvString = await converter.json2csvAsync(content_csv);
    fs.writeFileSync(output_path, csvString);

}

outputFiles().then(() => {
    console.log("I outputted the files");
});



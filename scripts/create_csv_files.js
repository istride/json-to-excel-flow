
var fs = require('fs');
var path = require("path");
var converter = require("json-2-csv");

//const flow_cat = "content-extra";
//const flow_cat = "content-relax"; 
//const flow_cat = "content-positive"; 
//const flow_cat = "content-time"; 
//const flow_cat = "help"; 
//const flow_cat = "supportive"; 
//const flow_cat = "survey"; 
//const flow_cat = "activity-adult"; 
//const flow_cat = "activity-baby"; 
//const flow_cat = "activity-child"; 
//const flow_cat = "activity-teen"; 
//const flow_cat = "all-test-flows"; 
//const flow_cat = "example-chat-flows"
//const flow_cat = "no_switch_nodes";
//const flow_cat = "welcome"

//const flow_cat = "check-ins"; 

//var input_path  = path.join(__dirname, "../examples/json/" + flow_cat +".json");

/*
var input_path  = path.join(__dirname, "../parentText/json/" + flow_cat +".json");
var full_json_string = fs.readFileSync(input_path).toString();
var row_obj = JSON.parse(full_json_string);
*/
const input_json_folder = path.join(__dirname, "../parentText/json");
var flow_cat_list = [];


fs.readdirSync(input_json_folder).forEach(file => {
    flow_cat_list.push(file.slice(0,-5));
  }); 

console.log(flow_cat_list)

const column_names = [ "row_id","type","from","condition","condition_var","condition_type","condition_name","save_name","message_text","choice_1",
"choice_2","choice_3","choice_4","choice_5","choice_6","choice_7","choice_8","choice_9","choice_10","image","audio","video",
"obj_id","_nodeId","no_response","_ui_type", "_ui_position"];




flow_cat_list.forEach(flow_cat => {
    var input_path  = path.join(input_json_folder, flow_cat +".json");
    var full_json_string = fs.readFileSync(input_path).toString();
    var row_obj = JSON.parse(full_json_string);

    var output_dir = path.join(__dirname, "../parentText/csv/" + flow_cat); 
    if (!fs.existsSync(output_dir)){
        fs.mkdirSync(output_dir);
    }

async function outputFiles() {


        var short_flow_names = {};
        var flow_names = {};

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
                            } else{
                                csv_row[col] = "";
                                curr_json_row[col].forEach(el => {
                                    if (el){
                                        csv_row[col] = csv_row[col] + el + ";";
                                    }else{
                                        csv_row[col] = csv_row[col] + ";";
                                    }
                                     });
                                     csv_row[col] = csv_row[col].slice(0,-1)
                            
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
            flow_sheet_name = flow_sheet_name.substring(4,flow_sheet_name.length); // remove PLH from name
            if (flow_sheet_name.length >31){
                flow_sheet_name = flow_sheet_name.substring(0,28);
                if (flow_sheet_name.endsWith("_")){
                    flow_sheet_name = flow_sheet_name.slice(0, -1);;
                }
            }
       
            if (short_flow_names.hasOwnProperty(flow_sheet_name)){
                short_flow_names[flow_sheet_name] =  short_flow_names[flow_sheet_name] +1;
                flow_sheet_name = flow_sheet_name + "_" + short_flow_names[flow_sheet_name];
            }else{
                short_flow_names[flow_sheet_name] = 1;
            }
            
            flow_names[flow] = flow_sheet_name;
            //var output_path = path.join(__dirname, "../examples/csv/"+ flow_cat + "/" + flow_sheet_name + ".csv");
            var output_path = path.join(__dirname, "../parentText/csv/"+ flow_cat + "/" + flow_sheet_name + ".csv");



      
       
        
        let csvString = await converter.json2csvAsync(curr_flow_csv);
        fs.writeFileSync(output_path, csvString);
        

    }
    var content_csv = [];
    for (fl_name in flow_names){
        let content_row = {};
        content_row.flow_type = "flow";
        content_row.flow_name = fl_name;
        content_row.sheet_name = flow_names[fl_name];
        content_row.status = "released";
        content_csv.push(content_row);
    }
    



    //var output_path = path.join(__dirname, "../examples/csv/" + flow_cat + "/==content_list==.csv");
    var output_path = path.join(__dirname, "../parentText/csv/" + flow_cat + "/==content_list==.csv");
    let csvString = await converter.json2csvAsync(content_csv);
    fs.writeFileSync(output_path, csvString);

}

outputFiles().then(() => {
    console.log("I outputted the files");
});


})
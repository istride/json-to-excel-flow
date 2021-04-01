var fs = require('fs');
var path = require("path");
var input_path = path.join(__dirname, "../examples/input-rapidpro/no_switch_nodes.json");
var json_string = fs.readFileSync(input_path).toString();
var obj_flows = JSON.parse(json_string);


var flows_sheets = {}

for(fl=0; fl<obj_flows.flows.length; fl++){
    flow = obj_flows.flows[fl];

    var rows_obj = [];
    var row_counter = 1;
    var processed_nodes = [];

    var curr_node = flow.nodes[0];
    var from_row = "start";
  
    while (processed_nodes.length < flow.nodes.length){
        
        if (curr_node.hasOwnProperty('router')){
            console.log("skipped router node")
        }else{
            curr_node.actions.forEach(action =>{
                if (action.type == "send_msg"){
                    row_counter = createSendMsgRow(curr_node,action,row_counter,from_row);
                
                }else if (action.type == "set_contact_field"){
                    row_counter = createSaveValueRow(curr_node,action,row_counter,from_row);
                   
                    
                }else if (action.type == "add_contact_groups"){
                    row_counter = createAddToGroupRow(curr_node,action,row_counter,from_row);  
                    
                }else if (action.type == "remove_contact_groups"){
                    row_counter = createRemoveFromGroupRow(curr_node,action,row_counter,from_row);   
                    
                }else if (action.type == "set_run_result"){
                    row_counter = createSaveFlowResultRow(curr_node,action,row_counter,from_row);
                   
                    
                }
                else{
                    console.log("action not implemented")
                }
            });
            processed_nodes.push(curr_node)
            from_row = row_counter -1;
            
            var next_node_id = curr_node.exits[0].destination_uuid;
            curr_node = flow.nodes.filter(nd => nd.uuid == next_node_id)[0];
            
        }
        


    }
    flows_sheets[flow.name] = JSON.parse(JSON.stringify(rows_obj));


}


var flows_sheets = JSON.stringify(flows_sheets, null, 2);
var output_path = path.join(__dirname, "../examples/output/row_no_switch_nodes.json");
fs.writeFile(output_path, flows_sheets, function (err, result) {
    if (err) console.log('error', err);
});


function createSendMsgRow(curr_node,curr_action,row_counter,from_row){
    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row.type = "send_message";
    curr_row.message_text = curr_action.text;
    let n_choice = 1;
    curr_action.quick_replies.forEach(qr => {
        curr_row["choice_" + n_choice] = qr;
        n_choice +=1;
    });
    curr_action.attachments.forEach(file =>{
        let file_type = file.split(":")[0];
        let file_url = file.slice(file_type.length +1);
        curr_row[file_type] = file_url;
    })
    curr_row._nodeId = curr_node.uuid;

    curr_row.from = from_row;
    
    rows_obj.push(curr_row)

    
    return row_counter +1
   
}

function createSaveValueRow(curr_node,curr_action,row_counter,from_row){
    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row.type = "save_value";

   
    curr_row.message_text = curr_action.field.name;
    curr_row.save_name = curr_action.value;

    curr_row._nodeId = curr_node.uuid;

    curr_row.from = from_row;
    
    rows_obj.push(curr_row)
    

    return  row_counter +1
}

function createAddToGroupRow(curr_node,curr_action,row_counter,from_row){
    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row.type = "add_to_group";

   
    curr_row.message_text = curr_action.groups[0].name;
   
    curr_row._nodeId = curr_node.uuid;

    curr_row.from = from_row;
    
    rows_obj.push(curr_row)
    

    return  row_counter +1
}

function createRemoveFromGroupRow(curr_node,curr_action,row_counter,from_row){
    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row.type = "remove_fron_group";

   
    curr_row.message_text = curr_action.groups[0].name;

    curr_row._nodeId = curr_node.uuid;

    curr_row.from = from_row;
    
    rows_obj.push(curr_row)
    

    return  row_counter +1
}


function createSaveFlowResultRow(curr_node,curr_action,row_counter,from_row){
    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row.type = "save_flow_result";

   
    curr_row.message_text = curr_action.name;
    curr_row.save_name = curr_action.value;

    curr_row._nodeId = curr_node.uuid;

    curr_row.from = from_row;
    
    rows_obj.push(curr_row)
    

    return  row_counter +1
}





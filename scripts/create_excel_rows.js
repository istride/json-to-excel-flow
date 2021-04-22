var fs = require('fs');
var path = require("path");
//var input_path = path.join(__dirname, "../examples/input-rapidpro/all_test_flows.json");
//var input_path = path.join(__dirname, "../examples/input-rapidpro/flows_from_excel.json");
var input_path = path.join(__dirname, "../parentText/plh-international-flavour.json");

var json_string = fs.readFileSync(input_path).toString();
var obj_flows = JSON.parse(json_string);


var flows_sheets = {}
const flow_cat_name = "PLH - Welcome";
const file_name = "others"

const other_cat_names = ["PLH - Help", "PLH - Activity","PLH - Content","PLH - Supportive","PLH - Survey","PLH - Welcome"]


for (fl = 0; fl < obj_flows.flows.length; fl++) {

    
    flow = obj_flows.flows[fl];
    var is_other_flow = true;
    other_cat_names.forEach(cat => {
        if (flow.name.startsWith(cat)){
            is_other_flow = false;
        }
    })
    if (!is_other_flow){
        continue
    }
    console.log(flow.name)

    nodes = flow.nodes;
    
    addParents(nodes);


    var rows_obj = [];
    var row_counter = 1;
    var uuid_processed_nodes = [];
    var node_waiting_list = [];
    var uuid_waiting_list = [];

    var curr_node = nodes[0];
    var from_row_id = "start";
    var row_counter = 1;
    

    while(uuid_waiting_list.length>0 || nodes.length >uuid_processed_nodes.length){
        console.log("start while loop--------------------------------")
        processNode(curr_node, from_row_id)
        
        
        if (uuid_waiting_list.length>0 ){
            curr_node = node_waiting_list[0];
            console.log("processing first element in waiting list ------------------------------")
            console.log(curr_node.uuid)
            curr_node.unprocessed_parents = [];
            from_row_id = null;
           // processNode(curr_node, null)
        }
        
    }
    console.log("tot nodes: "+ nodes.length + " processed: " + uuid_processed_nodes.length)
    

    flows_sheets[flow.name] = JSON.parse(JSON.stringify(rows_obj));

}


var flows_sheets = JSON.stringify(flows_sheets, null, 2);
var output_path = path.join(__dirname, "../parentText/json/" + file_name +  ".json");
fs.writeFile(output_path, flows_sheets, function (err, result) {
    if (err) console.log('error', err);
});





//////////////////////////////////////////////////////////////////////////////
function addParents(nodes) {
    for (nd = 0; nd < nodes.length; nd++) {
        let node_uuid = nodes[nd].uuid;
        nodes[nd].unprocessed_parents = [];

        for (let o_nd = 0; o_nd < nodes.length; o_nd++) {
            for (let ex = 0; ex < nodes[o_nd].exits.length; ex++) {
                if (nodes[o_nd].exits[ex].destination_uuid == node_uuid) {
                    nodes[nd].unprocessed_parents.push(nodes[o_nd].uuid);
                }
            }
        }
    }
}


function processNode(curr_node, from_row_id) {
    console.log("start processnode---------------------------")
    console.log("Processed nodes " + uuid_processed_nodes)
    console.log("curr node id " + curr_node.uuid )
    console.log("from row id " + from_row_id)

        if (curr_node.unprocessed_parents.length == 0) {
            // check if in waiting list and remove it
            let wl_index = uuid_waiting_list.indexOf(curr_node.uuid);
            if (wl_index > -1) {
                uuid_waiting_list.splice(wl_index, 1);
                node_waiting_list.splice(wl_index, 1);
            }
            // check if already processed
            if (uuid_processed_nodes.includes(curr_node.uuid)) {
                // create go_to row
                var go_to_row = createGoToRow(curr_node, row_counter, from_row_id)
                addConditions(curr_node, go_to_row)
                row_counter++;
                console.log("print go_to row \n " +go_to_row)

            } else {
                // create the corresponding type of rows (one per action if there are multiple)
                
                if (curr_node.hasOwnProperty('router')) {
                    createRouterRow(curr_node, row_counter, from_row_id)
                    
                    from_row_id = row_counter;
                    row_counter++;

                } else {
                    curr_node.actions.forEach(action => {
                        if (action.type == "send_msg") {
                            createSendMsgRow(curr_node, action, row_counter, from_row_id);

                        } else if (action.type == "set_contact_field") {
                            createSaveValueRow(curr_node, action, row_counter, from_row_id);


                        } else if (action.type == "add_contact_groups") {
                            createAddToGroupRow(curr_node, action, row_counter, from_row_id);

                        } else if (action.type == "remove_contact_groups") {
                            createRemoveFromGroupRow(curr_node, action, row_counter, from_row_id);

                        } else if (action.type == "set_run_result") {
                            createSaveFlowResultRow(curr_node, action, row_counter, from_row_id);


                        } else if (action.type == "set_contact_language") {
                            createSetLanguageRow(curr_node, action, row_counter, from_row_id);


                        }
                        else {
                            console.log("action not implemented")
                        }
                      
                        from_row_id = row_counter;
                        row_counter++;
                    });



                }

                // add conditions to the first row corresponding to the node
                var node_rows = rows_obj.filter(r =>(r._nodeId == curr_node.uuid));
                var first_row = node_rows.sort((r1,r2)=> r1.row_id - r2.row_id)[0];
                addConditions(curr_node, first_row)
                
                  

                uuid_processed_nodes.push(curr_node.uuid)
                for (let ex = 0; ex < curr_node.exits.length; ex++) {
                    
                    //define next node
                    let next_node_id = curr_node.exits[ex].destination_uuid;
                    let next_node = nodes.filter(nd => nd.uuid == next_node_id)[0];
                    if (next_node) {
                        //remove current node from list of unprecessed parents of next node
                        let par_index = next_node.unprocessed_parents.indexOf(curr_node.uuid);

                        
                        if (par_index > -1) {
                            next_node.unprocessed_parents.splice(par_index, 1);
                        } else {
                            console.log("error, parent not in the list")
                        }

                        // call function recursively on next node
                        processNode(next_node, from_row_id)

                    }


                }




            }



        } else {
            console.log("has unprocessed parents")
            if (uuid_waiting_list.includes(curr_node.uuid)) {
                curr_node.from_rows.push(from_row_id);

            } else {
                curr_node.from_rows = [from_row_id];
                uuid_waiting_list.push(curr_node.uuid);
                node_waiting_list.push(curr_node);
            }
            
            console.log("waiting list   " + uuid_waiting_list)
           

        }

return 

}



           
function addFromRows(curr_node,curr_row,from_row_id){
    curr_row.from = [];
    var temp_from = [];
    if (curr_node.hasOwnProperty("from_rows")){
        temp_from = Array.from(curr_node.from_rows);
        curr_node["from_rows"] = [];
    }
    if (from_row_id){
        temp_from.push(from_row_id);
    }
    // sort from rows with "start" always as first element
    if (temp_from.includes("start")){
        curr_row.from.push("start");
        let start_index = temp_from.indexOf("start");
            if (start_index > -1) {
                temp_from.splice(start_index, 1);
            }
     }
     curr_row.from  = curr_row.from.concat(temp_from.sort())
    
    
}

function createSendMsgRow(curr_node, curr_action, row_counter, from_row) {
    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row.type = "send_message";
    curr_row.message_text = curr_action.text;
    let n_choice = 1;
    curr_action.quick_replies.forEach(qr => {
        curr_row["choice_" + n_choice] = qr;
        n_choice += 1;
    });
    curr_action.attachments.forEach(file => {
        let file_type = file.split(":")[0];
        let file_url = file.slice(file_type.length + 1);
        curr_row[file_type] = file_url.replace("@(fields.voiceover_audio_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/Global/resourceGroup/voiceover/resourceType/audio/eng/")
                                    .replace("@(fields.relaxation_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/Global/resourceGroup/relaxation/eng/")
                                    .replace("@(fields.voiceover_video_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/Global/resourceGroup/voiceover/resourceType/video/eng/")
                                    .replace("@(fields.comic_path & \"","https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/Global/resourceGroup/comic/eng/")
                                    .replace("@(fields.image_path & \"","https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/Global/resourceGroup/image/universal/")
                                    .replace("@(fields.animated_audio_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/Global/resourceGroup/animated/resourceType/audio/eng/")
                                    .replace("@(fields.animated_video_path & \"", "https://idems-media-recorder.web.app/storage/project/PLH/subproject/Rapidpro/deployment/Global/resourceGroup/animated/resourceType/video/eng/")
                                    .slice(0,-2);
        
    })
    curr_row._nodeId = curr_node.uuid;

    addFromRows(curr_node,curr_row,from_row)
   
    rows_obj.push(curr_row)


    return

}

function createSaveValueRow(curr_node, curr_action, row_counter, from_row) {
    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row.type = "save_value";


    curr_row.message_text = curr_action.value;
    curr_row.save_name = curr_action.field.name;

    curr_row._nodeId = curr_node.uuid;
    addFromRows(curr_node,curr_row,from_row)
    

    rows_obj.push(curr_row)


    return
}

function createAddToGroupRow(curr_node, curr_action, row_counter, from_row) {
    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row.type = "add_to_group";


    curr_row.message_text = curr_action.groups[0].name;
    curr_row.obj_id = curr_action.groups[0].uuid;

    curr_row._nodeId = curr_node.uuid;

    addFromRows(curr_node,curr_row,from_row)

    rows_obj.push(curr_row)


    return
}

function createRemoveFromGroupRow(curr_node, curr_action, row_counter, from_row) {
    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row.type = "remove_from_group";


    curr_row.message_text = curr_action.groups[0].name;
    curr_row.obj_id = curr_action.groups[0].uuid;

    curr_row._nodeId = curr_node.uuid;

    addFromRows(curr_node,curr_row,from_row)

    rows_obj.push(curr_row)


    return
}


function createSaveFlowResultRow(curr_node, curr_action, row_counter, from_row) {
    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row.type = "save_flow_result";


    curr_row.message_text = curr_action.value;
    curr_row.save_name = curr_action.name;

    curr_row._nodeId = curr_node.uuid;

    addFromRows(curr_node,curr_row,from_row)

    rows_obj.push(curr_row)


    return
}

function createSetLanguageRow(curr_node, curr_action, row_counter, from_row){

    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row.type = "set_language";


    curr_row.message_text = curr_action.language;
 
    curr_row._nodeId = curr_node.uuid;

    addFromRows(curr_node,curr_row,from_row)

    rows_obj.push(curr_row)


    return
}


function createRouterRow(curr_node, row_counter, from_row){

    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row._nodeId = curr_node.uuid;
    addFromRows(curr_node,curr_row,from_row)

    if (curr_node.actions.length >0) {
        // check if it's enter flow node
        if ( curr_node.actions[0].type == "enter_flow"){
            curr_row.type = "start_new_flow";
            curr_row.message_text = curr_node.actions[0].flow.name;
            curr_row.obj_id = curr_node.actions[0].flow.uuid;
        }else{
            console.log("router node with action but not enter flow")
        }       
    } else {
        // other split nodes
        if (curr_node.router.type == "random"){
            curr_row.type = "split_random";
        } else if (curr_node.router.type == "switch"){
            if (curr_node.router.operand == "@input.text" && curr_node.router.hasOwnProperty("wait")){
                curr_row.type = "wait_for_response";
                curr_row.save_name = curr_node.router.result_name;
                if (curr_node.router.wait.hasOwnProperty("timeout")){
                    curr_row.no_response = curr_node.router.wait.timeout.seconds;
                }
            }else if (curr_node.router.operand == "@contact.groups"){
                curr_row.type = "split_by_group";
                curr_row.message_text = curr_node.router.cases[0].arguments[1];
            }else{
                curr_row.type = "split_by_value";
                curr_row.message_text = curr_node.router.operand;
            }
        } else {
            console.log("not recognised router type")
        }


    }
   
    rows_obj.push(curr_row)


    return

}

function createGoToRow(curr_node, row_counter, from_row){
    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row.type = "go_to";
    
    curr_row.from = [from_row];
    curr_row.message_text = Math.min(rows_obj.filter(row => row._nodeId == curr_node.uuid).map(row => row.row_id));
    rows_obj.push(curr_row)

    return curr_row
}



function addConditions(curr_node, curr_row){
    curr_row.condition = [];
    curr_row.condition_var = [];
    curr_row.condition_type = [];

    console.log("row before adding conditions ------------------")
    console.log(curr_row)

    // remove start from row.from
    var from_list = JSON.parse(JSON.stringify(curr_row.from));
    
    let start_index = curr_row.from.indexOf("start");
    if (start_index > -1) {
        from_list.splice(start_index, 1);
    }
    let from_set = [...new Set(from_list)].sort().filter(el => el);
    
    
    from_set.forEach(from_row_id =>{
        let from_row = rows_obj.filter(rw => (rw.row_id == from_row_id))[0];
        
        let from_node = nodes.filter(nd =>(nd.uuid== from_row._nodeId))[0];
        
        let from_exits = from_node.exits.filter(ex => (ex.destination_uuid == curr_node.uuid));
        if (from_exits.length == 0){
            console.log("error, curr_node is not a child of the from node")
        }else{
            from_exits.forEach(exit =>{
                if (!from_node.hasOwnProperty('router')){
                    curr_row.condition.push(null);
                    curr_row.condition_var.push(null);
                    curr_row.condition_type.push(null);
                }else{
                    
                    let from_cat = from_node.router.categories.filter(cat => (cat.exit_uuid == exit.uuid))[0];
                    if (from_node.actions.length >0) {
                        // check if it's enter flow node
                        if ( from_node.actions[0].type == "enter_flow"){
                            curr_row.condition.push(from_cat.name);
                            curr_row.condition_var.push(null);
                            curr_row.condition_type.push(null);
                          
                        }else{
                            console.log("router node with action but not enter flow")
                        }       
                    }else {
                        // other split nodes
                        if (from_node.router.type == "random"){
                            curr_row.condition.push(from_cat.name.replace("Bucket ",""));
                            curr_row.condition_var.push(null);
                            curr_row.condition_type.push(null);
    
                        } else if (from_node.router.type == "switch"){
                            if (from_node.router.operand == "@input.text" && from_node.router.hasOwnProperty("wait")){
                                if (from_cat.uuid == from_node.router.default_category_uuid){
                                    curr_row.condition.push(null);
                                    curr_row.condition_var.push(null);
                                    curr_row.condition_type.push(null);
                                }else if (from_cat.name == "No Response"){
                                    curr_row.condition.push("No Response");
                                    curr_row.condition_var.push(null);
                                    curr_row.condition_type.push(null);
        
                                }else {
                                    let from_case = from_node.router.cases.filter(cs => (cs.category_uuid == from_cat.uuid))[0];
                                    curr_row.condition.push(from_case.arguments);
                                    curr_row.condition_var.push(null);
                                    curr_row.condition_type.push(from_case.type);
        
                                }
                            }else if (from_node.router.operand == "@contact.groups"){
                                if (from_cat.uuid == from_node.router.default_category_uuid){
                                    curr_row.condition.push(null);
                                    curr_row.condition_var.push(null);
                                    curr_row.condition_type.push(null);
        
                                }else{
                                    curr_row.condition.push(from_cat.name);
                                    curr_row.condition_var.push(null);
                                    curr_row.condition_type.push(null);
        
                                }
                            }else{
                                if (from_cat.uuid == from_node.router.default_category_uuid){
                                    curr_row.condition.push(null);
                                    curr_row.condition_var.push(null);
                                    curr_row.condition_type.push(null);
        
                                }else{
                                    let from_case = from_node.router.cases.filter(cs => (cs.category_uuid == from_cat.uuid))[0];
                                    curr_row.condition.push(from_case.arguments);
                                    curr_row.condition_var.push(from_node.router.operand);
                                    curr_row.condition_type.push(from_case.type);
        
                                }
                            }

                        } else{
                            console.log("type of router not recognised")
                        }

                    }

                }


            })
        }

    })
    console.log("row with conditions ------------------")
    console.log(curr_row)

}

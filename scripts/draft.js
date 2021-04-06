var fs = require('fs');
var path = require("path");
//var input_path = path.join(__dirname, "../examples/input-rapidpro/no_switch_nodes.json");
var input_path = path.join(__dirname, "../examples/input-rapidpro/rejoin.json");

var json_string = fs.readFileSync(input_path).toString();
var obj_flows = JSON.parse(json_string);


var flows_sheets = {}

for (fl = 0; fl < obj_flows.flows.length; fl++) {
    flow = obj_flows.flows[fl];

    nodes = flow.nodes;
    addParents(nodes);


    var rows_obj = [];
    var row_counter = 1;
    var uuid_processed_nodes = [];
    var node_waiting_list = [];
    var uuid_waiting_list = [];

    var curr_node = nodes[0];
    var from_row = "start";
    var row_counter = 1;

    processNode(curr_node, {}, from_row)

    flows_sheets[flow.name] = JSON.parse(JSON.stringify(rows_obj));


}


var flows_sheets = JSON.stringify(flows_sheets, null, 2);
var output_path = path.join(__dirname, "../examples/output/row_no_switch_nodes.json");
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


function processNode(curr_node, prev_node, from_row) {



        if (curr_node.unprocessed_parents.length == 0) {
            // check if in waiting list and remove it
            let wl_index = uuid_waiting_list.indexOf(curr_node.uuid);
            if (wl_index > -1) {
                uuid_waiting_list.splice(wl_index, 1);
                node_waiting_list.splice(wl_index, 1);
            }
            // check if already processed
            if (uuid_processed_nodes.includes(curr_node.uuid)) {

            } else {
                // create the rows 
                if (curr_node.hasOwnProperty('router')) {
                    createRouterNode(curr_node, row_counter, from_row)
                    from_row = row_counter;
                    row_counter++;

                } else {
                    curr_node.actions.forEach(action => {
                        if (action.type == "send_msg") {
                            createSendMsgRow(curr_node, action, row_counter, from_row);

                        } else if (action.type == "set_contact_field") {
                            createSaveValueRow(curr_node, action, row_counter, from_row);


                        } else if (action.type == "add_contact_groups") {
                            createAddToGroupRow(curr_node, action, row_counter, from_row);

                        } else if (action.type == "remove_contact_groups") {
                            createRemoveFromGroupRow(curr_node, action, row_counter, from_row);

                        } else if (action.type == "set_run_result") {
                            createSaveFlowResultRow(curr_node, action, row_counter, from_row);


                        }
                        else {
                            console.log("action not implemented")
                        }
                        from_row = row_counter;
                        row_counter++;
                    });



                }

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
                        processNode(next_node, curr_node, from_row)

                    }


                }




            }



        } else {
            console.log("has unprocessed parents")
            if (uuid_waiting_list.includes(curr_node.uuid)) {
                curr_node.from_rows.push(from_row);

            } else {
                curr_node.from_rows = [from_row];
                uuid_waiting_list.push(curr_node.uuid);
                node_waiting_list.push(curr_node);
            }
            let par_index = curr_node.unprocessed_parents.indexOf(prev_node.uuid);
            if (par_index > -1) {
                curr_node.unprocessed_parents.splice(par_index, 1);
            } else {
                console.log("error, parent not in the list")
            }

        }



}

function oldprocessNode(curr_node) {
    if (curr_node) {

        if (curr_node.hasOwnProperty('router')) {

        } else {
            curr_node.actions.forEach(action => {
                if (action.type == "send_msg") {
                    row_counter = createSendMsgRow(curr_node, action, row_counter, from_row);

                } else if (action.type == "set_contact_field") {
                    row_counter = createSaveValueRow(curr_node, action, row_counter, from_row);


                } else if (action.type == "add_contact_groups") {
                    row_counter = createAddToGroupRow(curr_node, action, row_counter, from_row);

                } else if (action.type == "remove_contact_groups") {
                    row_counter = createRemoveFromGroupRow(curr_node, action, row_counter, from_row);

                } else if (action.type == "set_run_result") {
                    row_counter = createSaveFlowResultRow(curr_node, action, row_counter, from_row);


                }
                else {
                    console.log("action not implemented")
                }
                from_row = row_counter - 1;
            });
            processed_nodes.push(curr_node.uuid)


            var next_node_id = curr_node.exits[0].destination_uuid;
            curr_node = flow.nodes.filter(nd => nd.uuid == next_node_id)[0];
            processNode(curr_node)

        }
    }
    return
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
        curr_row[file_type] = file_url;
    })
    curr_row._nodeId = curr_node.uuid;

    curr_row.from = from_row;

    rows_obj.push(curr_row)


    return

}

function createSaveValueRow(curr_node, curr_action, row_counter, from_row) {
    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row.type = "save_value";


    curr_row.message_text = curr_action.field.name;
    curr_row.save_name = curr_action.value;

    curr_row._nodeId = curr_node.uuid;

    curr_row.from = from_row;

    rows_obj.push(curr_row)


    return
}

function createAddToGroupRow(curr_node, curr_action, row_counter, from_row) {
    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row.type = "add_to_group";


    curr_row.message_text = curr_action.groups[0].name;

    curr_row._nodeId = curr_node.uuid;

    curr_row.from = from_row;

    rows_obj.push(curr_row)


    return
}

function createRemoveFromGroupRow(curr_node, curr_action, row_counter, from_row) {
    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row.type = "remove_fron_group";


    curr_row.message_text = curr_action.groups[0].name;

    curr_row._nodeId = curr_node.uuid;

    curr_row.from = from_row;

    rows_obj.push(curr_row)


    return
}


function createSaveFlowResultRow(curr_node, curr_action, row_counter, from_row) {
    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row.type = "save_flow_result";


    curr_row.message_text = curr_action.name;
    curr_row.save_name = curr_action.value;

    curr_row._nodeId = curr_node.uuid;

    curr_row.from = from_row;

    rows_obj.push(curr_row)


    return
}


function createRouterNode(curr_node, row_counter, from_row){
    let curr_row = {};
    curr_row.row_id = row_counter;
    curr_row.type = "router";


    curr_row.message_text = "xxx";
    curr_row._nodeId = curr_node.uuid;

    curr_row.from = from_row;

    rows_obj.push(curr_row)


    return

}




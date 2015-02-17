var node_values = {};

var update_node = function(node) {
  node_values[node] = node_values[node] + 0.2
  value = Math.sin(node_values[node])*10 + 10
  //console.log(node)
  $('#netDynamisch g .node').parent().find('#'+node).parent().children().attr('r', value)
}

var intervals = [];

var inject_buttons = function() {
  nodes = $('#netDynamisch g .node')

  var location = $('#netGelijk')
  location.html('')
  for(var i = 0 ; i < nodes.length; i ++) {
    var node = nodes[i]
    
    node_values[node.id] = 10
    
    var html = $('<input class="button light button_'+node.id+'" name="'+node.id+'" type="button" value="'+node.id+'" id="button_'+node.id+'"/>');
    location.append(html);
    
    location.on("click", ".button_"+node.id, {current_node: node.id}, function(event) {
      var name = event.data.current_node
      
      intervals.push(setInterval(function(){update_node(name);}, 100));
      console.log('clicked!' + name);
    });
  } 
  console.log(node_values)
}


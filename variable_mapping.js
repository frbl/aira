function VariableMapping() {
  this.mapping = {
    "beweging": {"name": "Beweging", "type": "Positief"},
    "buiten_zijn": {"name": "Buiten zijn", "type": "Positief"},
    "concentratie": {"name": "Concentratie", "type": "Positief"},
    "eenzaamheid":{"name": "Eenzaamheid", "type": "Negatief"},
    "ontspanning":{"name": "Ontspanning", "type": "Positief"},
    "eigenwaarde":{"name": "Eigenwaarde", "type": "Positief"},
    "humor": {"name": "Humor", "type": "Positief"},
    "iets_betekenen": {"name": "Iets betekenen", "type": "Positief"},
    "hier_en_nu": {"name": "In het hier en nu leven", "type": "Positief"},
    "levenslust": {"name": "Levenslust", "type": "Positief"},
    "lichamelijk_ongemak": {"name": "Lichamelijk ongemak", "type": "Negatief"},
    "uw_eigen_factor": {"name": "Mijn eigen factor", "type": "Neutraal"},
    "onrust": {"name": "Onrust", "type": "Negatief"},
    "opgewektheid": {"name": "Opgewektheid", "type": "Positief"},
    "piekeren": {"name": "Piekeren", "type": "Negatief"},
    "somberheid": {"name": "Somberheid", "type": "Negatief"},
    "tekortschieten": {"name": "Tekortschieten", "type": "Negatief"}
  }
}

VariableMapping.prototype.get_value_from_network = function (id) {
  var regex = new RegExp('_', 'g');
  return id.charAt(0).toUpperCase() + id.slice(1).replace(regex,' ');
};

VariableMapping.prototype.get_network_id_from_value = function (value) {
  var regex = new RegExp(' ', 'g');
  return value.charAt(0).toLowerCase() + value.slice(1).replace(regex,'_');
};

VariableMapping.prototype.get_value = function (key) {
  if (key.constructor === Array) {
    var mapping = this.mapping;
    return key.map(function (current, id) {
      return mapping[current].name;
    });
  }
  return this.mapping[key].name;
};

VariableMapping.prototype.get_type = function (key) {
  if (key.constructor === Array) {
    var mapping = this.mapping;
    return key.map(function (current, id) {
      return mapping[current].type;
    });
  }
  return this.mapping[key].type;
};

VariableMapping.prototype.get_keys = function (value) {
  result = [];
  for(var i = 0 ; i < value.length; i++) {
    result.push(this.get_key(value[i]))
  }
  return result;
};


VariableMapping.prototype.get_key = function(value) {
  var keys = Object.keys(this.mapping);
  var middle = 0;
  var min = 0;
  var max = keys.length;
  // Apply binary search to find the definition
  while(min <= max) {
    middle = Math.floor(((max + min) / 2));
    if(this.mapping[keys[middle]].name == value) return keys[middle];
    if(this.mapping[keys[middle]].name < value) min = middle + 1;
    if(this.mapping[keys[middle]].name > value) max = middle - 1;
  }
  return null;
};

VariableMapping.prototype.get_key_linear = function (value) {
  for(key in this.mapping) {
    if(this.mapping.hasOwnProperty(key)) {
      if(this.mapping[key].name === value)
        return key;
    }
  }
  return null;
};


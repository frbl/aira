function VariableMapping() {
  this.mapping = {
    "beweging":            {"name": "Beweging", "translation":"Physical activity", "type": "Positief"},
    "buiten_zijn":         {"name": "Buiten zijn", "translation":"Being outside",  "type": "Positief"},
    "concentratie":        {"name": "Concentratie", "translation":"Concentration",  "type": "Positief"},
    "eenzaamheid":         {"name": "Eenzaamheid", "translation":"Loneliness",  "type": "Negatief"},
    "eigenwaarde":         {"name": "Eigenwaarde", "translation":"Self-esteem", "type": "Positief"},
    "humor":               {"name": "Humor", "translation":"Humor", "type": "Positief"},
    "iets_betekenen":      {"name": "Iets betekenen", "translation":"Mean something", "type": "Positief"},
    "hier_en_nu":          {"name": "In het hier en nu leven", "translation":"Mindfulness", "type": "Positief"},
    "levenslust":          {"name": "Levenslust", "translation":"", "type": "Positief"},
    "lichamelijk_ongemak": {"name": "Lichamelijk ongemak", "translation":"Physical discomfort", "type": "Negatief"},
    "uw_eigen_factor":     {"name": "Mijn eigen factor", "translation":"Personal factor", "type": "Neutraal"},
    "onrust":              {"name": "Onrust", "translation":"Agitation", "type": "Negatief"},
    "ontspanning":         {"name": "Ontspanning", "translation":"Relaxation", "type": "Positief"},
    "opgewektheid":        {"name": "Opgewektheid", "translation":"Cheerfulness", "type": "Positief"},
    "piekeren":            {"name": "Piekeren", "translation":"Rumination", "type": "Negatief"},
    "SomBewegUur":         {"name": "SomBewegUur", "translation":"Activity", "type": "Positief"},
    "SomPHQ":              {"name": "SomPHQ", "translation":"Depression", "type": "Negatief"},
    "somberheid":          {"name": "Somberheid", "translation":"Sadness", "type": "Negatief"},
    "tekortschieten":      {"name": "Tekortschieten", "translation":"Falling short on something", "type": "Negatief"}
  };

}

VariableMapping.prototype.get_value_from_network = function (id) {
  if(id.length === 0) return id;
  var regex = new RegExp('_', 'g');
  return id.charAt(0).toUpperCase() + id.slice(1).replace(regex,' ');
};

VariableMapping.prototype.get_network_id_from_value = function (value) {
  if(value.length === 0) return value;
  var regex = new RegExp(' ', 'g');
  return value.charAt(0).toLowerCase() + value.slice(1).replace(regex,'_');
};

VariableMapping.prototype.get_entry = function (key) {
  if (key.constructor === Array) {
    var mapping = this.mapping;
    return key.map(function (current, id) {
      return mapping[current];
    });
  }
  return this.mapping[key];
};


VariableMapping.prototype.get_translation = function (key) {
  result = this.get_entry(key);
  if (result.constructor === Array) {
    return result.map(function (current, id) {
      return current.translation;
    });
  }
  return result.translation;
};

VariableMapping.prototype.get_value = function (key) {
  result = this.get_entry(key);
  if (result.constructor === Array) {
    return result.map(function (current, id) {
      return current.name;
    });
  }
  return result.name;
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
    result.push(this.get_key(value[i]));
  }
  return result;
};

/**
 * TODO This function works because the mapping in the constructor is ordered by name. It is bad practice to assume
 * ordering in a js object
 */
VariableMapping.prototype.get_key = function(value) {
  var keys = Object.keys(this.mapping);
  var middle = 0;
  var min = 0;
  var max = keys.length;
  // Apply binary search to find the definition
  while(min <= max) {
    middle = Math.floor(((max + min) / 2));
    if(middle >= keys.length) return undefined;
    if(this.mapping[keys[middle]].name == value) return keys[middle];
    if(this.mapping[keys[middle]].name < value) min = middle + 1;
    if(this.mapping[keys[middle]].name > value) max = middle - 1;
  }
  return undefined;
};

VariableMapping.prototype.get_key_linear = function (value) {
  for(var key in this.mapping) {
    if(this.mapping.hasOwnProperty(key)) {
      if(this.mapping[key].name === value)
        return key;
    }
  }
  return undefined;
};


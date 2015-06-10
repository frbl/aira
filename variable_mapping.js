function VariableMapping() {
    this.mapping = {
        "ontspanning": "Ontspanning",
        "opgewektheid": "Opgewektheid",
        "hier_en_nu": "In het hier en nu leven",
        "concentratie": "Concentratie",
        "beweging": "Beweging",
        "iets_betekenen": "Iets betekenen",
        "humor": "Humor",
        "buiten_zijn": "Buiten zijn",
        "eigenwaarde": "Eigenwaarde",
        "levenslust": "Levenslust",
        "onrust": "Onrust",
        "somberheid": "Somberheid",
        "lichamelijk_ongemak": "Lichamelijk ongemak",
        "tekortschieten": "Tekortschieten",
        "piekeren": "Piekeren",
        "eenzaamheid": "Eenzaamheid",
        "uw_eigen_factor": "Mijn eigen factor"
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
            return mapping(current);
        });
    }
    return this.mapping[key];
};

/**
 * TODO quick and dirty solution, we should revise this to a O(1) solution
 * @param value
 * @returns {*}
 */
VariableMapping.prototype.get_keys = function (value) {
    result = [];
    for(var i = 0 ; i < value.length; i++) {
        result.push(this.get_key(value[i]))
    }
    return result;
};

/**
 * TODO quick and dirty solution, we should revise this to a O(1) solution
 * @param value
 * @returns {*}
 */
VariableMapping.prototype.get_key = function (value) {
    for(key in this.mapping) {
        if(this.mapping.hasOwnProperty(key)) {
            if(this.mapping[key] === value)
                return key;
        }
    }
    return null;
};

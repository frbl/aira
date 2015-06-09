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

VariableMapping.prototype.get_value = function (key) {
    if (key.constructor === Array) {
        var mapping = this.mapping;
        return key.map(function (current, id) {
            return mapping(current);
        });
    }
    return this.mapping(key);
};


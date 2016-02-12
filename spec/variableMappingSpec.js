describe("variableMapping", function() {
  variable_mapping = new VariableMapping();

  describe("getValueFromNetwork", function() {
    it('should get the correct value from a network using the network id.', function() {
      var expected = "Hier en nu";
      var result = variable_mapping.get_value_from_network("hier_en_nu");
      expect(result).toEqual(expected);
    });
    it('should return an empty string when the inputted id is empty', function() {
      var expected = "";
      var result = variable_mapping.get_value_from_network("");
      expect(result).toEqual(expected);
    });
    it('should return a capitalized string if it does not contain underscores', function() {
      var expected = "Tekortschieten";
      var result = variable_mapping.get_value_from_network("tekortschieten");
      expect(result).toEqual(expected);
    });
  });

  describe("getNetworkIdFromValue", function() {
    it('should get the correct id from a network using the network value.', function() {
      var expected = "hier_en_nu";
      var result = variable_mapping.get_network_id_from_value("Hier en nu");
      expect(result).toEqual(expected);
    });
    it('should return an empty string when the inputted id is empty', function() {
      var expected = "hier_en_nu";
      var result = variable_mapping.get_network_id_from_value("Hier en nu");
      expect(result).toEqual(expected);
    });
  });

  describe("getEntry", function() {
    it('should get the correct entry from the mapping when the key is a string', function() {
      var expected_name = "Mijn eigen factor";
      var expected_translation = "Personal factor";
      var expected_type = "Neutraal";
      var result = variable_mapping.get_entry("uw_eigen_factor");
      expect(result.name).toEqual(expected_name);
      expect(result.type).toEqual(expected_type);
      expect(result.translation).toEqual(expected_translation);
    });

    it('should get the correct entry from the mapping when the key is an array', function() {
      var expected_name1 = "Mijn eigen factor";
      var expected_translation1 = "Personal factor";
      var expected_type1 = "Neutraal";

      var expected_name2 = "Concentratie";
      var expected_translation2 = "Concentration";
      var expected_type2 = "Positief";
      var result = variable_mapping.get_entry(["uw_eigen_factor", "concentratie"]);

      expect(result[0].name).toEqual(expected_name1);
      expect(result[0].type).toEqual(expected_type1);
      expect(result[0].translation).toEqual(expected_translation1);

      expect(result[1].name).toEqual(expected_name2);
      expect(result[1].type).toEqual(expected_type2);
      expect(result[1].translation).toEqual(expected_translation2);
    });
  });

  describe("getTranslation", function() {
    it('should get the correct translation from the mapping when the key is a string', function() {
      var expected_translation = "Personal factor";
      var result = variable_mapping.get_translation("uw_eigen_factor");
      expect(result).toEqual(expected_translation );
    });

    it('should get the correct entry from the mapping when the key is an array', function() {
      var expected_translation1 = "Personal factor";
      var expected_translation2 = "Concentration";
      var result = variable_mapping.get_translation(["uw_eigen_factor", "concentratie"]);
      expect(result[0]).toEqual(expected_translation1);
      expect(result[1]).toEqual(expected_translation2);
    });
  });

  describe("getValue", function() {
    it('should get the correct translation from the mapping when the key is a string', function() {
      var expected = "Mijn eigen factor";
      var result = variable_mapping.get_value("uw_eigen_factor");
      expect(result).toEqual(expected);
    });

    it('should get the correct entry from the mapping when the key is an array', function() {
      var expected1 = "Mijn eigen factor";
      var expected2 = "Concentratie";
      var result = variable_mapping.get_value(["uw_eigen_factor", "concentratie"]);
      expect(result[0]).toEqual(expected1);
      expect(result[1]).toEqual(expected2);
    });
  });

  describe("getKeys", function() {
    it('should return the correct keys for an array of values.', function() {
      var keys = ["beweging","buiten_zijn","concentratie","eenzaamheid","ontspanning","eigenwaarde","humor","iets_betekenen","hier_en_nu","levenslust","lichamelijk_ongemak","uw_eigen_factor","onrust","opgewektheid","piekeren","somberheid","tekortschieten"];
        var expected = keys;
        var result = variable_mapping.get_keys(variable_mapping.get_value(keys));
        expect(result).toEqual(expected);
    });

    it('should return undefined when the key is not found', function() {
      var expected = ['concentratie', undefined, undefined, undefined, undefined] ;
      var result = variable_mapping.get_keys(['Concentratie', 'ziemand anders zijn Mijn eigen factor', 'a', 'b', '']);
      expect(result).toEqual(expected);
    });
  });

  describe("getKey", function() {
    it('should return the correct key for a value.', function() {
      var keys = ["beweging","buiten_zijn","concentratie","eenzaamheid","ontspanning","eigenwaarde","humor","iets_betekenen","hier_en_nu","levenslust","lichamelijk_ongemak","uw_eigen_factor","onrust","opgewektheid","piekeren","somberheid","tekortschieten"];

      for(var i = 0 ; i < keys.length ; i++ ) {
        var expected = keys[i];
        var result = variable_mapping.get_key(variable_mapping.get_value(keys[i]));
        expect(result).toEqual(expected);
      }
    });

    it('should return undefined when the key is not found', function() {
      var expected;
      var result = variable_mapping.get_key('ziemand anders zijn Mijn eigen factor');
      expect(result).toEqual(expected);
    });
  });

  describe("getKeyLinear", function() {
    it('should return the correct key for a value.', function() {
      var keys = ["beweging","buiten_zijn","concentratie","eenzaamheid","ontspanning","eigenwaarde","humor","iets_betekenen","hier_en_nu","levenslust","lichamelijk_ongemak","uw_eigen_factor","onrust","opgewektheid","piekeren","somberheid","tekortschieten"];

      for(var i = 0 ; i < keys.length ; i++ ) {
        var expected = keys[i];
        var result = variable_mapping.get_key_linear(variable_mapping.get_value(keys[i]));
        expect(result).toEqual(expected);
      }
    });

    it('should return undefined when the key is not found', function() {
      var expected;
      var result = variable_mapping.get_key_linear('ziemand anders zijn Mijn eigen factor');
      expect(result).toEqual(expected);
    });
  });
});


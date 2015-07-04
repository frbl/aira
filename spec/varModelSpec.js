describe("VarModel", function() {
  describe("VarModel constructor", function() {
    it("should set the correct things in the variables", function() {
      var first_value = 0.5,
        second_value = 0.2,
        var_coefficients = [createMatrix(first_value, 3,3, false),
          createMatrix(second_value, 3,3, false)];
      var node_names = ['beweging', 'concentratie', 'hier_en_nu'],
        data_summary = 'summary',
        make_possitive = true,
        variable_mapping = new VariableMapping();

      var varmodel = new VarModel(var_coefficients, node_names, data_summary, make_possitive, variable_mapping );

      expect(varmodel.lags).toEqual(var_coefficients.length);
      expect(varmodel.number_of_variables).toEqual(node_names.length);
      expect(varmodel.data_summary).toEqual(data_summary);
      expect(varmodel.variable_mapping).toEqual(variable_mapping);
      expect(varmodel.var_coefficients.length).toEqual(node_names.length);
      expect(varmodel.number_of_exogen_variables).toEqual(0);
      for(var i = 0 ; i < var_coefficients.length ; i++){
        expect(varmodel.var_coefficients[i].length).toEqual(node_names.length * var_coefficients.length);
        for(var j = 0 ; j < var_coefficients.length ; j++){
          for(var k = 0 ; k < node_names.length ; k++){
            var expected = j === 0 ? first_value : second_value;
            expect(varmodel.var_coefficients[i][j*node_names.length + k]).toEqual(expected);
          }
        }
      }
    });

    describe("converts coefficients if needed", function() {
      it("should not call the convert_coefficients function if it make positive = false", function() {
        var first_value = 0.5,
          second_value = 0.2,
          var_coefficients = [createMatrix(first_value, 3,3, false),
            createMatrix(second_value, 3,3, false)];
        var node_names = ['beweging', 'concentratie', 'hier_en_nu'],
          data_summary = 'summary',
          make_possitive = false,
          variable_mapping = new VariableMapping();
        spyOn(VarModel.prototype, 'convert_coefficients');
        var varmodel = new VarModel(var_coefficients, node_names, data_summary, make_possitive, variable_mapping );
        expect(VarModel.prototype.convert_coefficients).not.toHaveBeenCalled();
      });

      it("should call the convert_coefficients function if it make positive = true", function() {
        var first_value = -0.5,
          second_value = 0.2,
          var_coefficients = [createMatrix(first_value, 3,3, false),
            createMatrix(second_value, 3,3, false)];
        var node_names = ['beweging', 'onrust', 'hier_en_nu'],
          data_summary = 'summary',
          make_possitive = true,
          variable_mapping = new VariableMapping();
        spyOn(VarModel.prototype, 'convert_coefficients');
        var varmodel = new VarModel(var_coefficients, node_names, data_summary, make_possitive, variable_mapping );
        expect(VarModel.prototype.convert_coefficients).toHaveBeenCalled();
      });
    });
  });

  describe("with a created varmodel", function() {
    var varmodel,
    node_names,
    data_summary,
    make_possitive,
    first_value,
    second_value,
    var_coefficients;

    beforeEach(function() {
      first_value = 0.5;
      second_value = 0.2;
      var_coefficients = [createMatrix(first_value, 3,3, false),
        createMatrix(second_value, 3,3, false)];

      node_names = ['beweging', 'concentratie', 'hier_en_nu'];
      data_summary = 'summary';
      make_possitive = true;
      variable_mapping = new VariableMapping();
      varmodel = new VarModel(var_coefficients, node_names, data_summary, make_possitive, variable_mapping );

    });

    describe("get_data_summary", function() {

    });

    describe("get_node_name", function() {
      it("returns the node name based on id", function() {
        expect(varmodel.get_node_name(0)).toEqual('beweging');
        expect(varmodel.get_node_name(1)).toEqual('concentratie');
        expect(varmodel.get_node_name(2)).toEqual('hier_en_nu');
      });

      it("returns undifined if not found", function() {
        expect(varmodel.get_node_name(9)).toBeUndefined();
      });
    });

    describe("convert_coefficients", function() {

    });

    describe("to_json", function() {

    });

    describe("set_coefficient", function() {

    });

    describe("get_coefficient", function() {

    });

  });
});

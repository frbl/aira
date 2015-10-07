describe("VarModel", function () {
    describe("VarModel constructor", function () {
        it("should set the correct things in the variables", function () {
            var first_value = 0.5,
                second_value = 0.2,
                var_coefficients = [createMatrix(first_value, 3, 3, false),
                    createMatrix(second_value, 3, 3, false)];
            var node_names = ['beweging', 'concentratie', 'hier_en_nu'],
                data_summary = 'summary',
                make_possitive = true,
                variable_mapping = new VariableMapping();

            var varmodel = new VarModel(var_coefficients, node_names, data_summary, make_possitive, variable_mapping);

            expect(varmodel.lags).toEqual(var_coefficients.length);
            expect(varmodel.number_of_variables).toEqual(node_names.length);
            expect(varmodel.data_summary).toEqual(data_summary);
            expect(varmodel.variable_mapping).toEqual(variable_mapping);
            expect(varmodel.var_coefficients.length).toEqual(node_names.length);
            expect(varmodel.number_of_exogen_variables).toEqual(0);
            for (var i = 0; i < var_coefficients.length; i++) {
                expect(varmodel.var_coefficients[i].length).toEqual(node_names.length * var_coefficients.length);
                for (var j = 0; j < var_coefficients.length; j++) {
                    for (var k = 0; k < node_names.length; k++) {
                        var expected = j === 0 ? first_value : second_value;
                        expect(varmodel.var_coefficients[i][j * node_names.length + k]).toEqual(expected);
                    }
                }
            }
        });

        describe("converts coefficients if needed", function () {
            it("should not call the convert_coefficients function if it make positive = false", function () {
                var first_value = 0.5,
                    second_value = 0.2,
                    var_coefficients = [createMatrix(first_value, 3, 3, false),
                        createMatrix(second_value, 3, 3, false)];
                var node_names = ['beweging', 'concentratie', 'hier_en_nu'],
                    data_summary = 'summary',
                    make_possitive = false,
                    variable_mapping = new VariableMapping();
                spyOn(VarModel.prototype, 'convert_coefficients');
                var varmodel = new VarModel(var_coefficients, node_names, data_summary, make_possitive, variable_mapping);
                expect(VarModel.prototype.convert_coefficients).not.toHaveBeenCalled();
            });

            it("should call the convert_coefficients function if it make positive = true", function () {
                var first_value = -0.5,
                    second_value = 0.2,
                    var_coefficients = [createMatrix(first_value, 3, 3, false),
                        createMatrix(second_value, 3, 3, false)];
                var node_names = ['beweging', 'onrust', 'hier_en_nu'],
                    data_summary = 'summary',
                    make_possitive = true,
                    variable_mapping = new VariableMapping();
                spyOn(VarModel.prototype, 'convert_coefficients');
                var varmodel = new VarModel(var_coefficients, node_names, data_summary, make_possitive, variable_mapping);
                expect(VarModel.prototype.convert_coefficients).toHaveBeenCalled();
            });
        });
    });

    describe("with a created varmodel", function () {
        var varmodel,
            node_names,
            significant_network,
            make_possitive,
            first_value,
            second_value,
            exo_value,
            var_coefficients,
            exogen_names,
            exogen_var_coefficients,
            variable_mapping,
            y_values, exogen_values;

        beforeEach(function () {
            first_value = 0.5;
            second_value = 0.2;
            exo_value = 0.1;

            var_coefficients = [createMatrix(first_value, 3, 3, false),
                createMatrix(second_value, 3, 3, false)];

            exogen_var_coefficients = createMatrix(exo_value, 3, 7, false);

            y_values = [
                makeFilledArray(3, 1),
                makeFilledArray(3, 2),
                makeFilledArray(3, 3),
                makeFilledArray(3, 4),
                makeFilledArray(3, 5),
                makeFilledArray(3, 6),
                makeFilledArray(3, 7),
                makeFilledArray(3, 8)
            ];
            exogen_values = [
                makeFilledArray(7, 0),
                makeFilledArray(7, 0),
                makeFilledArray(7, 0),
                makeFilledArray(7, 0),
                makeFilledArray(7, 0),
                makeFilledArray(7, 0),
                makeFilledArray(7, 0),
                makeFilledArray(7, 0)
            ];

            node_names = ['beweging', 'concentratie', 'hier_en_nu'];
            exogen_names = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
            significant_network = 'summary';


            make_possitive = true;
            variable_mapping = new VariableMapping();

            varmodel = new VarModel(
                var_coefficients, exogen_var_coefficients,
                node_names, exogen_names,
                y_values, exogen_values,
                significant_network,
                make_possitive,
                variable_mapping
            );


        });

        describe("get_data_summary", function () {

        });

        describe("get_node_name", function () {
            it("returns the node name based on id", function () {
                expect(varmodel.get_node_name(0)).toEqual('beweging');
                expect(varmodel.get_node_name(1)).toEqual('concentratie');
                expect(varmodel.get_node_name(2)).toEqual('hier_en_nu');
            });

            it("returns undifined if not found", function () {
                expect(varmodel.get_node_name(9)).toBeUndefined();
            });
        });

        describe("convert_coefficients", function () {

        });

        describe("to_json", function () {

        });

        describe("set_coefficient", function () {

        });

        describe("get_coefficient", function () {

        });

        describe("getResiduals", function () {
           it('should determine the correct residuals in a var_model', function() {


           });
        });

        describe("get_coefficients", function () {
            it('can retrieve the coefficient matrix for each lag', function() {
                expect(varmodel.getCoefficients(1)).toEqual(var_coefficients[0]);
                expect(varmodel.getCoefficients(2)).toEqual(var_coefficients[1]);
            });

            it('throws if the lag is higher than the model lag', function() {
                lag = 10;
                var func = function() {
                    varmodel.getCoefficients(lag);
                };
                expect(func).toThrow();
            });

            it('throws if the lag is lower than the model lag', function() {
                lag = 0;
                var func = function() {
                    varmodel.getCoefficients(lag);
                };
                expect(func).toThrow();
            });
        });


        describe("calculateNewOutput", function () {
            it('can detect that the endogen dimensions are incorrect', function () {
                var endogen = [[1, 2, 3, 4, 5, 6]];
                var exogen = [[1, 2, 3, 4, 5, 6], [6, 5, 4, 3, 2, 1]];
                var func = function() {
                    varmodel.calculateNewOutput(endogen, exogen);
                };
                expect(func).toThrow();
            });

            it('can calculate a new output', function () {
                var endogen = [[1, 2, 3], [6, 5, 4]];
                var exogen = [1, 0, 0, 0, 0, 0, 0];
                var result = varmodel.calculateNewOutput(endogen, exogen);
                console.log(result);
                expect(result).toEqual([[3.1,3.1,3.1],[3.1,3.1,3.1]])
            });
        });
    });
});

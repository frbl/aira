fdescribe("JsonParser", function () {

    describe("with json parser", function () {
        var variable_mapping, network, json_parser;
        beforeEach(function () {
            variable_mapping = fabricateVariableMapping();
            network = fabricateFullNetworkData();
            json_parser = new JsonParser(network, variable_mapping);
        });

        describe("hgiNetworkDataToMatrix", function () {
            it('create a correct matrix from the network', function () {
                var result = json_parser.hgiNetworkDataToMatrix();
                var expected = createMatrix(0, 6, 6, false);
                expected[0][4] = 0.108850037288526;
                expected[5][4] = -0.0947853465411713;
                expected[2][5] = -0.447246920242226;
                expect(result).toEqual(expected);
            });
        });



        describe("nodeKeysFromJson", function () {
            it('can generate a list of node ids from a json file', function () {
                var expected = ["humor", "onrust", "iets_betekenen", "ontspanning", "hier_en_nu", "concentratie"];
                var result = json_parser.nodeKeysFromJson();
                expect(result).toEqual(expected);
            });
        });

        describe("coefficientMatrix", function () {
            it("returns the full network data matrix", function () {
                var node_names = json_parser.nodeKeysFromJson();
                var expected = [
                    [
                        [0.1704, -0.3918, -0.0134, 0.3107, 0.3039, -0.0119],
                        [0.0296, -0.043, 0.0468, -0.0368, 0.0574, -0.0006],
                        [0.0664, 0.5613, -0.0422, 0.0653, 0.0464, -0.0891],
                        [-0.0294, -0.0703, -0.0338, 0.1404, 0.0935, -0.0581],
                        [0.1089, -0.1074, -0.0225, -0.0468, -0.1311, -0.0948],
                        [0.0491, -0.484, -0.4472, -0.3944, -0.2095, -0.0021]
                    ], [
                        [-0.009, 0, 0, 0, 0, 0],
                        [0, 0.1038, 0, 0, 0, 0],
                        [0, 0, -0.0788, 0, 0, 0],
                        [0, 0, 0, 0.1833, 0, 0],
                        [0, 0, 0, 0, -0.0447, 0],
                        [0, 0, 0, 0, 0, -0.03]
                    ]
                ];
                var result = json_parser._private.coefficientMatrix(node_names);

                // The result should have two lags
                expect(result.length).toEqual(2);
                expect(result).toEqual(expected);
            });
        });

        describe("getEndogenCoefficientMatrix", function () {
            it("returns the endogenous network data matrix", function () {
                var expected = [
                    [
                        [0.1704, -0.3918, -0.0134, 0.3107, 0.3039, -0.0119],
                        [0.0296, -0.043, 0.0468, -0.0368, 0.0574, -0.0006],
                        [0.0664, 0.5613, -0.0422, 0.0653, 0.0464, -0.0891],
                        [-0.0294, -0.0703, -0.0338, 0.1404, 0.0935, -0.0581],
                        [0.1089, -0.1074, -0.0225, -0.0468, -0.1311, -0.0948],
                        [0.0491, -0.484, -0.4472, -0.3944, -0.2095, -0.0021]
                    ], [
                        [-0.009, 0, 0, 0, 0, 0],
                        [0, 0.1038, 0, 0, 0, 0],
                        [0, 0, -0.0788, 0, 0, 0],
                        [0, 0, 0, 0.1833, 0, 0],
                        [0, 0, 0, 0, -0.0447, 0],
                        [0, 0, 0, 0, 0, -0.03]
                    ]
                ];
                var result = json_parser.getEndogenCoefficientMatrix();

                // The result should have two lags
                expect(result.length).toEqual(2);
                expect(result).toEqual(expected);
            });
        });

        describe("getExogenCoefficientMatrix", function () {
            it("returns the endogenous network data matrix", function () {
                var expected = [
                    [9.5421, -16.3173, 17.0506, 10.2573, 16.2163, -1.2641, 33.7139, 16.8846, -51.6501, -35.6045, 5.9614, -17.0835, -20.7591, -1.7733, 5.1076, 4.4091, -8.7778, 8.8778, 9.6143, 6.6054],
                    [9.9884, 5.7542, 9.4883, 30.5308, 7.1607, 6.1902, -2.3908, -4.3125, 16.5217, 11.3868, 29.3339, 5.8187, -1.0691, -2.2521, 2.8564, 0.858, -4.2609, 3.0825, -0.8947, -2.162],
                    [28.1629, -8.2353, 19.8026, -26.511, 36.4852, 40.2795, 19.8559, -20.167, -18.5427, 5.0798, -18.4264, -36.6158, -5.8779, 3.4777, 1.7468, -9.3778, -10.7051, -10.0034, -8.3406, -8.1198],
                    [55.3902, -26.2798, 9.7043, -20.0128, -6.3874, -35.4194, 5.7456, 13.5135, -28.0846, -27.3401, -17.7171, 10.4817, 0.922, -1.5966, -2.9675, -2.7173, -9.4672, -5.415, 0.5637, -3.0932],
                    [105.5512, -1.676, -20.6744, 9.0622, -19.7278, -1.7126, 13.4086, -24.8732, -23.613, -12.0982, -11.6577, -13.9154, 3.3816, 5.9367, 0.2088, 1.6897, -2.0609, -3.7518, 3.0383, 1.249],
                    [160.3258, -11.9826, -6.4823, 18.4721, -17.522, 12.5431, -69.5453, -1.3595, -27.3519, 1.6397, 15.367, -56.2527, 0.1947, -10.6441, -3.5588, -15.9643, -22.1987, -25.4829, -22.2455, -16.1131]
                ];
                var result = json_parser.getExogenCoefficientMatrix();

                // The result should have 1 lag, for all variables
                expect(result.length).toEqual(json_parser.nodeKeysFromJson().length);
                expect(result[0].length).toEqual(json_parser.exogenKeysFromJson().length);
                expect(result).toEqual(expected);
            });
        });

        describe('getYDataFromJson', function () {
            var result,
                node_names;
            beforeEach(function () {
                node_names = json_parser.nodeKeysFromJson();
                result = json_parser.getYDataFromJson();
            });

            it('have the correct dimensions', function () {
                var current_result = dimensions(result);
                var number_of_variables = node_names.length;
                expect(current_result).toEqual([90, number_of_variables]);
            });
        });

        describe('getExogenDataFromJson', function () {
            var result,
                node_names;
            beforeEach(function () {
                node_names = json_parser.nodeKeysFromJson();
                result = json_parser.getExogenDataFromJson();
            });

            it('have the correct dimensions', function () {
                var total_number_of_vars = 26;
                var current_result = dimensions(result);
                var number_of_exo_variables = total_number_of_vars - node_names.length;
                expect(current_result).toEqual([88, number_of_exo_variables]);
            });
        });
    });
});

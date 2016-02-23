var lags, number_of_variables, aira, simulation, visualization_engine, impulse_response_calculator, view_model;
var synthetic = false;
var data;
var variable_mapping;

var Initializer;

Initializer = (function () {
    var _gui;

    function Initializer() {
        _gui = new Gui();
    }

    Initializer.prototype.main = function (json_data) {
        data = json_data;
        view_model = new ViewModel();
        variable_mapping = new VariableMapping();

        var json_parser = new JsonParser(json_data, variable_mapping);
        var data_keys = json_parser.getHgiNetworkJsonKeys(json_data);
        var max_steps = 100;
        var max_interpolation = 500;
        var max_threshold = 1;

        var prediction_select = $('#prediction');
        var interpolation_select = $('#interpolation');
        var threshold_select = $('#threshold');
        var improvement_select = $('#improvement');

        _gui.appendSelectOptions(data_keys, '#data_select');
        _gui.generateSelectOptions(1, max_steps, 1, '#prediction');
        _gui.generateSelectOptions(0, max_interpolation, 1, '#interpolation');
        _gui.generateSelectOptions(0, max_threshold, 0.1, '#threshold');
        _gui.generateSelectOptions(-100, 100, 1, '#improvement');
        _gui.generateSelectOptions(0, 3000, 100, '#bootstrap_iterations');

        prediction_select.find("option[value='" + (10 > max_steps ? max_steps : 10) + "']").attr('selected', 'selected');
        interpolation_select.find("option[value='" + (25 > max_interpolation ? max_interpolation : 300) + "']").attr('selected', 'selected');
        threshold_select.find("option[value='" + (0.1 > max_threshold ? max_threshold : 0.1) + "']").attr('selected', 'selected');
        improvement_select.find("option[value='10']").attr('selected', 'selected');

        $('body').on("change", ".data_select", function () {
            if (simulation != null) simulation.clear();
            $('#netDynamisch').html('');
            $('#netFullDynamisch').html('');
            _startSimulation(data[$('#data_select').val()]);
        });

        var data_select = $('.data_select');
        data_select.find("option[value='extra network 2']").attr('selected', 'selected');
        data_select.trigger('change');
    };

    var _startSimulation = function (json_data) {
        var json_parser = new JsonParser(json_data, variable_mapping);
        var node_names = json_parser.nodeKeysFromJson();
        var exogen_names = json_parser.exogenKeysFromJson();

        var significant_network = json_parser.getSignificantNetworkFromJson();

        // Var coefficients
        var var_coefficients = json_parser.getEndogenCoefficientMatrix();
        var exogen_var_coefficients = json_parser.getExogenCoefficientMatrix();

        // The actual data
        var y_values = json_parser.getYDataFromJson(node_names);
        var exogen_values = json_parser.getExogenDataFromJson(node_names);

        var convert_to_positive = true;

        var_model = new VarModel(
            var_coefficients, exogen_var_coefficients,
            node_names, exogen_names,
            y_values, exogen_values,
            significant_network,
            convert_to_positive,
            variable_mapping
        );

        // Copy the object
        data_directedNetwerk = $.extend(true, {}, var_model.getSignificantNetwork());
        render_netDynamisch();

        data_directedNetwerk = var_model.to_json();
        render_netDynamisch('#netFullDynamisch');

        _gui.injectButtons(node_names);
        console.log(node_names);
        simulation = new Simulation(node_names);
        impulse_response_calculator = new ImpulseResponseCalculator(var_model);
        aira = new Aira(impulse_response_calculator, var_model, view_model);
        visualization_engine = new Visualization(node_names);
    };

    Initializer.prototype._startSimulation = _startSimulation;


    return Initializer;
})();

$(document).ready(function () {
    $.ajax({
        url: "one_network.json",
        type: "GET",
        dataType: 'json',
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
            console.log('Error!');
        },
        success: function (data, text) {
            console.log('Successfully loaded network data');
            var initializer = new Initializer();
            initializer.main(data);
        }
    });
});
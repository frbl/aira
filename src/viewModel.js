function ViewModel() {
}

ViewModel.prototype.get_steps = function () {
    if (typeof this.prediction === 'undefined') {
        this.prediction = $('#prediction');
    }
    return this.prediction.val();
};

ViewModel.prototype.get_threshold = function() {
    if (typeof this.threshold === 'undefined') {
        this.threshold = $('#threshold');
    }
    return this.threshold.val();
};

ViewModel.prototype.get_interpolation = function() {
    if (typeof this.interpolation === 'undefined') {
        this.interpolation = $('#interpolation');
    }
    return this.interpolation.val()
};

ViewModel.prototype.get_improvement = function() {
    if (typeof this.improvement === 'undefined') {
        this.improvement = $('#improvement');
    }
    return this.improvement.val()
};

ViewModel.prototype.get_bootstrap_iterations = function() {
    if (typeof this.bootstrap_iterations === 'undefined') {
        this.bootstrap_iterations = $('#bootstrap_iterations');
    }
    return this.bootstrap_iterations.val()
};

ViewModel.prototype.get_chk_bootstrap = function() {
    if (typeof this.chk_bootstrap === 'undefined') {
        this.chk_bootstrap = $('#chk-bootstrap');
    }
    return this.chk_bootstrap.prop('checked')
};


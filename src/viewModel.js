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
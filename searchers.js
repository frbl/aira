var PRECISION = 14;
var linearSearch = function (value, data) {
    var i = 0;
    value = parseFloat(value.toPrecision(PRECISION));
    while (i < data.length && parseFloat(data[i].toPrecision(PRECISION)) < value) {
        i++
    }
    return i;
};

var binarySearch = function (value, data) {
    var res, split, modifier;
    split = res = Math.floor(data.length / 2);

    while (split <= data.length && data[split + 1] != undefined && !(data[split + 1] > value && data[split] <= value)) {
        res = Math.max(Math.floor(res / 2), 0);

        modifier = 0;
        if (data[split + res] > value) modifier = -1;
        else                        modifier = 1;

        split = split + (res * modifier);
    }
    return split;
};

function getSortedKeys(obj) {
    var keys = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) keys.push(key);

    }

    return keys.sort(function (a, b) {
        return obj[a] - obj[b]
    });
}
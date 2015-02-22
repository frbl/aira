var linearSearch = function(value, data) {
    var i = 0;
    while(data[i] <= value && i <= data.length) {i++}
    return i-1;
};

var binarySearch = function(value, data) {
    var res, split, modifier;
    split = res = Math.floor(data.length / 2);

    while(split <= data.length && data[split + 1] != undefined &&
            !(data[split + 1] > value && data[split] <= value)) {
        res = Math.max(Math.floor(res / 2), 0);

        modifier = 0;
        if(data[split+res] > value) modifier = -1;
        else                        modifier = 1;

        split = split + (res * modifier);
    }
    return split;
};
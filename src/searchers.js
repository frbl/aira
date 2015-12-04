var searchers = {
    linearSearch: function (value, data) {
        var PRECISION = 14;

        var i = 0;
        value = parseFloat(value.toPrecision(PRECISION));
        while (i < data.length && parseFloat(data[i].toPrecision(PRECISION)) < value) {
            i++
        }
        return i;
    },

    binarySearch: function (value, data) {
        var middle = 0;
        var min = 0;
        var max = data.length;
        while (min <= max) {
            middle = Math.floor(((max + min) / 2));
            if (data[middle] == value) return middle;
            if (data[middle] < value) min = middle + 1;
            if (data[middle] > value) max = middle - 1;
        }
        return null;
    },

    getSortedKeys: function (obj) {
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) keys.push(key);

        }

        return keys.sort(function (a, b) {
            return obj[a] - obj[b]
        });
    }
};
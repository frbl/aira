// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    files: [
      'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js',
      'src/**.js',
      'spec/**.js'
    ]
  });
};

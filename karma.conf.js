// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    browsers: ['Chrome'],
    autoWatch: true,
    singleRun: false,

    timeout: 120000,
    browserNoActivityTimeout: 120000,

    files: [
      'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js',
      'https://code.jquery.com/jquery-2.1.4.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js',
      'bower_components/mathjs/dist/math.min.js',
      'src/**.js',
      'spec/**.js',
      'spec/factories/**.js'
    ],


  });
};


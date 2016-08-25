// karma.conf.js
module.exports = function(config) {
  config.set({
    basePath: '.',
    frameworks: ['jasmine'],
    browsers: ['Chrome'],
    autoWatch: true,
    singleRun: false,
    timeout: 120000,
    browserNoActivityTimeout: 120000,
    files: [
      'bower_components/d3/d3.min.js',
      'bower_components/underscore/underscore-min.js',
      'bower_components/mathjs/dist/math.min.js',
      'bower_components/jquery/dist/jquery.min.js',
      'app/script/**.js',
      'spec/**.js',
      'spec/factories/**.js'
    ],
    reporters: ['progress', 'coverage'],

    preprocessors: {
      'app/script/**/*.js': 'coverage'
    },
    coverageReporter: {
      type: 'lcovonly',
      dir: 'coverage/'
    }
  });
};

// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    browsers: ['Chrome'],
    autoWatch: true,
    singleRun: false,


    files: [
      'https://code.jquery.com/jquery-2.1.4.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js',
      'src/**.js',
      'spec/**.js',
      'spec/factories/**.js'
    ],


  });
};


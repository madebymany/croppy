var dest = "./build";
var src = './src';

module.exports = {
  sass: {
    src: src + "/stylesheets/**/*.scss",
    dest: dest + "/stylesheets",
    opts: {
      dev: {
        sourceComments: 'map', 
        sourceMap: 'sass'
      },
      build: {
        outputStyle: 'compressed'
      }
    }
  }
};

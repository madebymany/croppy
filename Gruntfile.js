/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-rigger');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jst');

  grunt.initConfig({

    meta: {
      version: '0.1.1',
      banner: '// Croppy, v<%= meta.version %>\n'
    },

    'jasmine' : {
      'croppy': {
        src : 'dist/croppy.js',
        options: {
          specs : 'spec/**/*.spec.js',
          helpers : 'spec/helpers/*.js'
        }
      }
    },

    jst: {
      compile: {
        files: {
          "src/croppy.templates.js": ["src/templates/*"]
        }
      }
    },

    rig: {
      build: {
        src: ['<banner:meta.banner>', 'src/croppy.js'],
        dest: 'dist/croppy.js'
      }
    },

    uglify: {
      options: {
        mangle: false
      },
      standard: {
        files: {
          'dist/croppy.min.js': ['dist/croppy.js']
        }
      }
    },

    watch: {
      scripts: {
        files: ['src/*.js', 'src/templates/*.jst'],
        tasks: ['jst', 'rig']
      }
    },

    jshint: {
      all: ['dist/croppy.js'],
      options: {
        curly: true,
        eqeqeq: true,
        immed: false,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        jasmine : false,
        describe : false,
        beforeEach : false,
        expect : false,
        it : false,
        spyOn : false,
        jQuery: true,
        console: true,
        URL:true,
        webkitURL:true
      }
    }
  });

  // Default task.
  grunt.registerTask('default', ['jst', 'rig']);
  grunt.registerTask('test', ['jasmine']);
  grunt.registerTask('build', ['default', 'uglify', 'test']);

};

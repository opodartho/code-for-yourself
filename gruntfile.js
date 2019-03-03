/* global module:false */
module.exports = function(grunt) {
  var port = grunt.option('port') || 8000;
  var root = grunt.option('root') || './build';
  const sass = require('node-sass');

  if (!Array.isArray(root)) root = [root];

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        ie8: true
      },
      build: {
        src: 'node_modules/reveal.js/js/reveal.js',
        dest: 'build/js/reveal.min.js'
      }
    },

    sass: {
      options: {
        implementation: sass,
        sourceMap: true
      },
      core: {
        src: 'node_modules/reveal.js/css/reveal.scss',
        dest: 'build/css/reveal.css'
      },
      themes: {
        expand: true,
        cwd: 'node_modules/reveal.js/css/theme/source',
        src: ['black.sass', 'black.scss'],
        dest: 'build/css/theme',
        ext: '.css'
      }
    },

    autoprefixer: {
      core: {
        src: 'node_modules/reveal.js/css/reveal.css'
      }
    },

    cssmin: {
      options: {
        compatibility: 'ie9'
      },
      compress: {
        src: 'node_modules/reveal.js/css/reveal.css',
        dest: 'build/css/reveal.min.css'
      }
    },

    jshint: {
      options: {
        curly: false,
        eqeqeq: true,
        immed: true,
        esnext: true,
        latedef: 'nofunc',
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        eqnull: true,
        browser: true,
        expr: true,
        loopfunc: true,
        node: true,
        globals: {
          head: false,
          module: false,
          console: false,
          unescape: false,
          define: false,
          exports: false
        }
      },
      files: [ 'Gruntfile.js' ]
    },

    connect: {
      server: {
        options: {
          port: port,
          base: root,
          livereload: true,
          open: true,
          useAvailablePort: true
        }
      }
    },

    clean: ['build'],

    copy: {
      dist: {
        files: [
          {
            expand: true,
            src: ['slides/*.md', 'slides/*.html'],
            dest: 'build/'
          },
          {
            expand: true,
            cwd: 'node_modules/reveal.js',
            src: ['lib/**/*', 'plugin/**/*'],
            dest: 'build/'
          }
        ]
      }
    },

    
    buildcontrol: {
      options: {
        dir: 'build',
        commit: true,
        push: true,
        message: 'Build from %sourceCommit% on branch %sourceBranch%'
      },
      pages: {
        options: {
          remote: '<%= pkg.repository.url %>',
          branch: 'gh-pages'
        }
      }
    },
    
    watch: {
      js: {
        files: [ 'gruntfile.js'],
        tasks: 'js'
      },
      index: {
        files: [
          'templates/_index.html',
          'templates/_section.html',
          'slides/*'
        ],
        tasks: 'build'
      },
      options: {
        livereload: true
      }
    }

  });

  grunt.registerTask('buildIndex', 'Build index.html from templates/_index.html and slides/slides.json.', function() {
    var html, indexTemplate, sectionTemplate, slides;
    indexTemplate = grunt.file.read('templates/_index.html');
    sectionTemplate = grunt.file.read('templates/_section.html');
    slides = grunt.file.readJSON('slides/slides.json');
    html = grunt.template.process(indexTemplate, {
      data: {
        slides: slides,
        section: function(slide) {
          return grunt.template.process(sectionTemplate, {
            data: {
              slide: slide
            }
          });
        }
      }
    });
    return grunt.file.write('build/index.html', html);
  });

  // Dependencies
  require('load-grunt-tasks')(grunt);

  // Default task
  grunt.registerTask( 'default', [ 'css', 'js' ] );

  // JS task
  grunt.registerTask( 'js', [ 'jshint', 'uglify' ] );

  // Theme CSS
  grunt.registerTask( 'css-themes', [ 'sass:themes' ] );

  // Core framework CSS
  grunt.registerTask( 'css-core', [ 'sass:core', 'autoprefixer', 'cssmin' ] );

  // All CSS
  grunt.registerTask( 'css', [ 'sass', 'autoprefixer', 'cssmin' ] );

  // Build presentation to deploy
  grunt.registerTask('build', [ 'default', 'buildIndex', 'copy' ] );

  
  // Deploy to Github Pages
  grunt.registerTask('deploy', [ 'build', 'buildcontrol', 'clean' ] );
  

  // Serve presentation locally
  grunt.registerTask( 'serve', ['build', 'connect', 'watch' ] );

  // Run tests
  grunt.registerTask( 'test', [ 'jshint' ] );

};

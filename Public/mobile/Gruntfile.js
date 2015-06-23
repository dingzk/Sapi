/*!
 * Ratchet's Gruntfile
 * http://goratchet.com
 * Copyright 2014 Connor Sears
 * Licensed under MIT (https://github.com/twbs/ratchet/blob/master/LICENSE)
 */

/* jshint node: true */
module.exports = function (grunt) {
  'use strict';

  // Force use of Unix newlines
  grunt.util.linefeed = '\n';

  RegExp.quote = function (string) {
    return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  // var generateRatchiconsData = require('./grunt/ratchicons-data-generator.js');
var appcache = require("./grunt/appcache")(grunt);


  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Metadata.
    meta: {
      components: 'components/',
      srcPath:        'src/sass/',
      distPath:       'dist/',
      docsPath:       'docs/dist/',
      docsAssetsPath: 'docs/assets/',
      tourpalEntry:   'entry/tourpal/',
      tourpalDist:    'dist/tourpal/',
    },

    banner: '/*!\n' +
            ' * =====================================================\n' +
            ' * <%= pkg.name %> v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
            ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
            ' *\n' +
            ' * v<%= pkg.version %> designed by @elong.\n' +
            ' * =====================================================\n' +
            ' */\n',

    clean: {
      dist: ['<%= meta.distPath %>', '<%= meta.docsPath %>']
    },

    concat: {
      ratchet: {
        options: {
          banner: '<%= banner %>'
        },
        src: [
          'js/modals.js',
          'js/popovers.js',
          'js/push.js',
          'js/segmented-controllers.js',
          'js/sliders.js',
          'js/toggles.js'
        ],
        dest: '<%= meta.distPath %>js/<%= pkg.name %>.js'
      }
    },

    sass: {
      options: {
        banner: '<%= banner %>',
        sourcemap: true,
        style: 'expanded',
        unixNewlines: true
      },
      dist: {
        files: {
          '<%= meta.distPath %>css/<%= pkg.name %>.css': '<%= meta.srcPath %>elongfe.scss',
        }
      },
      tourpal: {
        files: {
          '<%= meta.tourpalDist %>main.css': '<%= meta.tourpalEntry %>main.scss',
         }
      }
    },

    csscomb: {
      options: {
        config: '<%= meta.srcPath%>.csscomb.json'
      },
      dist: {
        files: {
          '<%= meta.distPath %>css/<%= pkg.name %>.css': '<%= meta.distPath %>css/<%= pkg.name %>.css',
          '<%= meta.distPath %>css/<%= pkg.name %>-theme-android.css': '<%= meta.distPath %>css/<%= pkg.name %>-theme-android.css',
          '<%= meta.distPath %>css/<%= pkg.name %>-theme-ios.css': '<%= meta.distPath %>css/<%= pkg.name %>-theme-ios.css'
        }
      },
      // docs: {
      //   files: {
      //     '<%= meta.docsAssetsPath %>css/docs.css': '<%= meta.docsAssetsPath %>css/docs.css'
      //   }
      // }
    },

    copy: {
      fonts: {
        expand: true,
        src: 'fonts/*',
        dest: '<%= meta.distPath %>'
      },
      tourpal: {
        files: [
          {expand: false, src: ['<%= meta.tourpalDist %>main.min.css'], dest: '../Elven/Elong.Elven.tourpal/Elong.Elven.tourpal.Web/tourpalcontent/css/main.css'},
          {expand: false, src: ['<%= meta.tourpalDist %>main.js'], dest: '../Elven/Elong.Elven.tourpal/Elong.Elven.tourpal.Web/tourpalcontent/js/main.js'},
          {expand: false, src: ['grunt/tourpal.appcache'], dest: '../Elven/Elong.Elven.tourpal/Elong.Elven.tourpal.Web/tourpalcontent/tourpal.appcache'},
        ],
      }
      // docs: {
      //   expand: true,
      //   cwd: '<%= meta.distPath %>',
      //   src: [
      //     '**/*'
      //   ],
      //   dest: '<%= meta.docsPath %>'
      // }
    },

    cssmin: {
      options: {
        banner: '', // set to empty; see bellow
        keepSpecialComments: '*' // set to '*' because we already add the banner in sass
      },
      ratchet: {
        src: '<%= meta.distPath %>css/<%= pkg.name %>.css',
        dest: '<%= meta.distPath %>css/<%= pkg.name %>.min.css'
      },
      theme: {
        files: {
          '<%= meta.distPath %>css/<%= pkg.name %>-theme-ios.min.css': '<%= meta.distPath %>css/<%= pkg.name %>-theme-ios.css',
          '<%= meta.distPath %>css/<%= pkg.name %>-theme-android.min.css': '<%= meta.distPath %>css/<%= pkg.name %>-theme-android.css'
        }
      },
      tourpal: {
        files: {
          '<%= meta.tourpalDist %>main.min.css': '<%= meta.tourpalDist %>main.css'
        }
      }
      // docs: {
      //   src: [
      //     '<%= meta.docsAssetsPath %>css/docs.css',
      //     '<%= meta.docsAssetsPath %>css/pygments-manni.css'
      //   ],
      //   dest: '<%= meta.docsAssetsPath %>css/docs.min.css'
      // }
    },

    uglify: {
      options: {
        banner: '<%= banner %>',
        compress: true,
        mangle: true,
        preserveComments: false
      },
      ratchet: {
        src: '<%= concat.ratchet.dest %>',
        dest: '<%= meta.distPath %>js/<%= pkg.name %>.min.js'
      },
      tourpal: {
        src: '<%= meta.tourpalDist %>main.js',
        dest: '<%= meta.tourpalDist %>main.min.js'
      },
      requirejs: {
        src: 'lib/require.js',
        dest: '<%= meta.distPath %>require.min.js'
      }
      // docs: {
      //   src: [
      //     '<%= meta.docsAssetsPath %>js/docs.js',
      //     '<%= meta.docsAssetsPath %>js/fingerblast.js'
      //   ],
      //   dest: '<%= meta.docsAssetsPath %>js/docs.min.js'
      // }
    },

    watch: {
      src: {
        files: [
          '<%= meta.srcPath %>**/*.scss'
        ],
        tasks: ['sass']
      },
      tourpal: {
        files: [
          '<%= meta.tourpalEntry %>**/*.scss',
        ],
        tasks: ['sass:tourpal']
      },
      md: {
        files: [
          '<%= meta.components %>**/*.md',
        ],
        tasks: ['md']
      }
    },

    jekyll: {
      docs: {}
    },

    jshint: {
      options: {
        // jshintrc: 'js/.jshintrc'
        '-W033' : true,
        '-W014' : true,
        '-W030' : true,
        '-W032' : true,
        '-W069' : true,
        '-W061' : true,
        '-W103' : true,//__proto__     
      },
      grunt: {
        src: ['Gruntfile.js', 'grunt/*.js']
      },
      src: {
        src: 'js/*.js'
      },
      tourpal: {
        src: ['entry/tourpal/**/*.js','src/js/**/*.js']
      },
      public: {
        src: ['public/**/*.js']
      },
      components: {
        src: ['components/**/*.js']
      },
      docs: {
        src: ['<%= meta.docsAssetsPath %>/js/docs.js', '<%= meta.docsAssetsPath %>/js/fingerblast.js']
      }
    },

    jscs: {
      options: {
        config: 'js/.jscsrc'
      },
      grunt: {
        src: '<%= jshint.grunt.src %>'
      },
      src: {
        src: '<%= jshint.src.src %>'
      },
      docs: {
        src: '<%= jshint.docs.src %>'
      }
    },

    csslint: {
      options: {
        csslintrc: '<%= meta.srcPath%>.csslintrc'
      },
      src: [
        '<%= meta.distPath %>/css/<%= pkg.name %>.css',
        '<%= meta.distPath %>/css/<%= pkg.name %>-theme-android.css',
        '<%= meta.distPath %>/css/<%= pkg.name %>-theme-ios.css'
      ],
      docs: {
        options: {
          ids: false
        },
        src: ['<%= meta.docsAssetsPath %>/css/docs.css']
      }
    },
    connect: {
        server: {
            options: {
                port: 3000,
                base: ''
            }
        }
    },
    open: {
        kitchen: {
//            path: 'http://localhost:3000/entry/tourpal/entry.html'
            // path: 'http://localhost:3000/entry/payment/password.html'
            path: 'http://localhost:3000/entry/flight/entry.html'
        }
    },
    // validation: {
    //   options: {
    //     charset: 'utf-8',
    //     doctype: 'HTML5',
    //     failHard: true,
    //     reset: true,
    //     relaxerror: [
    //       'Attribute ontouchstart not allowed on element body at this point.',
    //       'Bad value X-UA-Compatible for attribute http-equiv on element meta.',
    //       'Consider using the h1 element as a top-level heading only \\(all h1 elements are treated as top-level headings by many screen readers and other tools\\)\\.'
    //     ]
    //   },
    //   files: {
    //     src: '_site/**/*.html'
    //   }
    // },
    requirejs: {
      tourpal: {
          options: {
              baseUrl: "./",
              // baseUrl: 'entry/tourpal/',
              name : 'lib/almond',
              // mainConfigFile: "entry/tourpal/config.js",
              include : [
                'entry/tourpal/main'
              ],
              out: '<%= meta.tourpalDist %>main.js',
              optimize : 'none',
              wrap : true,
              
          }
      }
    },
    sed: {
      versionNumber: {
        pattern: (function () {
          var old = grunt.option('oldver');
          return old ? RegExp.quote(old) : old;
        })(),
        replacement: grunt.option('newver'),
        recursive: true
      }
    }
  });

  // Load the plugins
  require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
  require('time-grunt')(grunt);


  // 核心
  grunt.registerTask('dist-css', ['sass:dist', 'csscomb:dist', 'cssmin']);
  grunt.registerTask('dist-js', ['concat', 'uglify']);
  grunt.registerTask('core', ['clean', 'dist-css', 'dist-js', 'copy', 'build-ratchicons-data']);

  // autosass
  grunt.registerTask('autosass', ['watch:tourpal']);


  // 解决方案
  grunt.registerTask('tourpal', ["sass:tourpal","cssmin:tourpal","requirejs:tourpal", "uglify:requirejs","uglify:tourpal"]);

};

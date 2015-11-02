
  'use strict';

  var dir_path = location.pathname.split("/").reverse().slice(2).reverse().join("/");

  var dojoConfig = {
    async: true,
    parseOnLoad: true,
    packages: [{
      name: 'react',
      location: dir_path + '/bower_components/react',
      //location: 'https://cdnjs.cloudflare.com/ajax/libs/react/0.14.0/',
      main: 'react'
    }, {
      name: 'react-dom',
      location: dir_path + '/bower_components/react',
      //location: 'https://cdnjs.cloudflare.com/ajax/libs/react/0.14.0/',
      main: 'react-dom'
    }, {
      name: 'fixedDataTable',
      location: dir_path + '/bower_components/fixed-data-table/dist',
      //location: 'https://cdnjs.cloudflare.com/ajax/libs/fixed-data-table/0.4.7/',
      main: 'fixed-data-table'
    }, {
      name: 'reactWidgets',
      location: dir_path + '/src/widget'
    }]
  };


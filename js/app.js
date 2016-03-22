// Ionic Starter App 

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ionic.service.core',  'starter.controllers', 'satellizer', 'ngCordova'])
 
.run(function($ionicPlatform , $ionicPopup, $cordovaStatusbar, $rootScope, $http, $cordovaNetwork) {
  $ionicPlatform.ready(function() {



console.log(localStorage.getItem('user'));


    var push = PushNotification.init({
    "android": {
        "senderID": "332867885048"
    },
    "ios": {
        "alert": "true",
        "badge": "true",
        "sound": "true"
    },
    "windows": {}
});

push.on('registration', function(data) {
    
   //alert("alert1");
   //alert(data.registrationId);
   localStorage.setItem('pushKey', data.registrationId);



});

push.on('notification', function(data) {

  alert('Tienes una notificacion: '+data.title);
    console.log(data.message);
    // data.title,
    // data.count,
    // data.sound,
    // data.image,
    console.log( data.additionalData);
});

push.on('error', function(e) {
    console.log(e.message);

});
 
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      //StatusBar.styleDefault();
      $cordovaStatusbar.overlaysWebView(true);
      $cordovaStatusbar.styleHex('#546f7b');
    }


  });



})

.config(function($stateProvider, $urlRouterProvider, $authProvider, $ionicAppProvider) {




  $authProvider.loginUrl = 'http://ancoradelserrallo.com/api/authApp';
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.reservas', { 
    url: '/reservas',
    views: {
      'menuContent': {
        templateUrl: 'templates/reservas.html',
        controller: 'ReservasCtrl'
      }
    }
  })

  .state('app.noConnection', { 
    url: '/noConnection',
    views: {
      'menuContent': {
        templateUrl: 'templates/noConnection.html',
        controller: 'noConnection'
      }
    }
  })

  .state('app.res', {
      url: '/res',
      views: {
        'menuContent': {
          templateUrl: 'templates/res.html',
          controller: 'ResCtrl'
        }
      }
    })
    .state('app.comentarios', {
      url: '/comentarios',
      views: {
        'menuContent': {
          templateUrl: 'templates/comentarios.html',
          controller: 'ComentariosCtrl'
        }
      }
    })

  .state('app.galeria', {
    url: '/galeria',
    views: {
      'menuContent': {
        templateUrl: 'templates/galeria.html',
        controller: 'GaleriaCtrl'
      }
    }
  })

  .state('app.usuarios', {
    url: '/usuarios',
    views: {
      'menuContent': {
        templateUrl: 'templates/usuarios.html',
        controller: 'UsuariosCtrl'
      }
    }
  })

  .state('app.login', {
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  if(localStorage.getItem('user')) $urlRouterProvider.otherwise("/app/reservas");
  if(!localStorage.getItem('user')) $urlRouterProvider.otherwise('/app/login');




});

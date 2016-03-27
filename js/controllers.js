angular.module('starter.controllers', ['onezone-datepicker']).filter('groupBy', function () {
  var results={};
    return function (data, key) {
        if (!(data && key)) return;
        var result;
    try{
    try{
      if(!this.$id){
        result={};
      }else{
        var scopeId = this.$id;
        if(!results[scopeId]){
          results[scopeId]={};
          this.$on("$destroy", function() {
            delete results[scopeId];
          });
        }
        result = results[scopeId];
      }
    }catch(err){
      console.log("Hubo un error");
    }

        for(var groupKey in result){
      try{
        result[groupKey].splice(0,result[groupKey].length);
      }catch(err){
        console.log("Hubo un error");
      }
    }

        for (var i=0; i<data.length; i++) {
            if (!result[data[i][key]])
                result[data[i][key]]=[];
            result[data[i][key]].push(data[i]);
        }

        var keys = Object.keys(result);
        for(var k=0; k<keys.length; k++){
      try{
        if(result[keys[k]].length===0)
        delete result[keys[k]];
      }catch(err){
        console.log("Hubo un error");
      }
        }
    }catch(err){
      console.log("Hubo un error");
    }
        return result;
    };
}).controller('AppCtrl', function($scope,$rootScope, $ionicModal, $timeout, $state, $ionicHistory, $http, $cordovaNetwork) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});


  // Perform the login action when the user submits the login form
 /* $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };*/
  $scope.logout = function(){




         if(localStorage.getItem('pushKey')){

                  var dId=ionic.Platform.device().uuid;
        var eu= localStorage.getItem('emailUser');

        $http.post('http://ancoradelserrallo.com/logoutApp', {email:eu,deviceId:dId}) 
        .success(function(res){
        console.log(res)
        console.log("exito logout");
        })
        .error(function(err){
        console.error(err)
        console.log("error logout"+err);
        });
        }

    localStorage.clear();
    $rootScope.userData = false;
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('app.login');
  }


  $rootScope.url = 'http://ancoradelserrallo.com/'
  $rootScope.userData = localStorage.getItem('user') || false;
  if($rootScope.userData != false) $state.go("app.reservas");
  //$window.localStorage.clear()



})

.controller('ComentariosCtrl', function($scope, $http, $ionicHistory, $rootScope, $ionicLoading) {

    $scope.$on('app:notificationC', function(event, data) {
       // console.log(data);
       // if (data.refresh)
      //  {
            console.log("comentarioPush");
            $scope.getComentarios();
       // }
    });


  // GET
  $scope.getComentarios = function(){
      console.log("getComenario");
        $ionicLoading.show({
      template: 'Loading...'
    });

    $http.get('http://ancoradelserrallo.com/api/authApp/getComentarios')
    .success(function(res){
      $scope.comentarios = res.comentarios;
      $rootScope.comentariosActivos = 0;
      $rootScope.comentariosPapelera = 0;
      for(var i = 0; i < $scope.comentarios.length; i++){
        if($scope.comentarios[i].estado == '0') $rootScope.comentariosPapelera++;
        else $rootScope.comentariosActivos++;
      }
      $ionicLoading.hide()
    })
  }
  $scope.getComentarios()


    $scope.tabComentarios = 'comentarios'
  // Update
  $scope.updateComentario = function(id, estado){
    $http.post('http://ancoradelserrallo.com/api/authApp/updateComentario',{id: id, estado: estado})
    .success(function(res){
      console.log(res)
      $scope.getComentarios();
    })
    .error(function(err){
      console.error(err)
    })
  }

  // Delete one
  $scope.deleteComentario = function(id){
    $http.post('http://ancoradelserrallo.com/api/authApp/deleteComentario', {id: id})
    .success(function(res){
      $scope.getComentarios();
    })
  }



  $scope.$on("$ionicView.afterLeave", function () {
     $ionicHistory.clearCache();
  });
})

 // GALERIA

.controller('GaleriaCtrl', function($scope, $stateParams, $http, $ionicHistory, $ionicLoading, $cordovaCamera, $cordovaFile, $rootScope, $cordovaFileTransfer) {
  $rootScope.galeriaBtns = true;
  $scope.srcImage = '';


  /*$scope.imagenP = [10,20,30]
  $scope.findImg = function(){
    num = 0;
    for(var i = 0; i < $scope.imagenP.length; i++){
      if($scope.imagenP[i] == 10) 
        num++;
    }
    alert(num)
  }
  $scope.findImg()*/
  // Get
  $scope.getGaleria = function(){
    $ionicLoading.show({
      template: 'Loading...'
    });
      $http.get('http://ancoradelserrallo.com/api/authApp/getGaleria')
      .success(function(res){
        $scope.imagenes = res.galeria;
        $ionicLoading.hide()
      })
      .error(function(){
        alert('error de conexión');
        $ionicLoading.hide();
      });
  }


  $scope.getGaleria();

  $scope.imgToDel = []

  $scope.selectImg = function(index){
    if($scope.imagenes[index].del){
      $scope.imagenes[index].del = false
    }else{
      $scope.imagenes[index].del = true
    }
  }

  $rootScope.getPicture = function(){
    var options = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 250,
            targetHeight: 250,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: true
    }

    $cordovaCamera.getPicture(options).then(function(imageData){
      var currentName = imageData.replace(/^.*[\\\/]/, '');
      var path = cordova.file.externalRootDirectory + imageData.substr(imageData.lastIndexOf('/') + 1);

      var d = new Date(),
          n = d.getTime(),
          newFileName = n + '.jpg';


          // Subir imagen
          var server = 'http://ancoradelserrallo.com/api/authApp/uploadImageGallery';
          var options = {
            fileKey: 'file',
            fileName: imageData.substr(imageData.lastIndexOf('/') + 1),
            chunkedMode: false,
            mimeType: 'image/jpeg'
          };
          $cordovaFileTransfer.upload(server, path, options)
          .then(function(res){
              $scope.getGaleria();
          }, function(err){
            alert('ERROR => ' + err)
          }, function(progress){

          });

      

    }, function(err){
      alert('error => ' + JSON.stringify(err))
    })
  }

  $rootScope.imgToGal = function() {
    

    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY
    };

    $cordovaCamera.getPicture(options).then(function(imageURI) {
      window.resolveLocalFileSystemURI(imageURI, function(fileEntry) {
        $scope.picData = fileEntry.nativeURL;
        $scope.ftLoad = true;
        var image = document.getElementById('myImage');
        image.src = fileEntry.nativeURL;
        });
      $ionicLoading.show({template: 'Foto acquisita...', duration:500});
    },
    function(err){
      $ionicLoading.show({template: 'Errore di caricamento...', duration:500});
    })
  

  }

 /* $scope.uploadPicture = function() {
    $ionicLoading.show({template: 'Sto inviando la foto...'});
    var fileURL = $scope.picData;
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    options.chunkedMode = true;

    var params = {};
    params.value1 = "someparams";
        params.value2 = "otherparams";

    options.params = params;

    var ft = new FileTransfer();
    ft.upload(fileURL, encodeURI("http://www.yourdomain.com/upload.php"), $scope.getGaleria(), function(error) {
      $ionicLoading.show({template: 'Errore di connessione...'});
      $ionicLoading.hide();}, options)
    }

  }*/








  $rootScope.papelera = function() {
    alert('trash')
  }

  $scope.$on("$ionicView.afterLeave", function () {
    $rootScope.galeriaBtns = false
     $ionicHistory.clearCache();
  });

})

.controller('ResCtrl', function($scope, $http, $ionicHistory, $ionicLoading) {


$ionicHistory.clearHistory();
    $ionicLoading.show({
      template: 'Loading...'
    });
  $scope.tabRes = 'res'
  $scope.getRes = function() {
    console.log(localStorage.getItem('emailUser'));
    $http.get('http://ancoradelserrallo.com/api/authApp/getRes?email='+localStorage.getItem('emailUser'))
    .success(function(data){
      console.log(data);
      $scope.res = data.restaurant
      $ionicLoading.hide()
    })
  }
 
  $scope.saveRes = function(){

$scope.res.email=localStorage.getItem('emailUser');
    $ionicLoading.show({
      template: 'Un momento por favor...'
    })
    $http.post('http://ancoradelserrallo.com/api/authApp/saveRes',$scope.res)
    .success(function(res){

      console.log($scope.res)
      $ionicLoading.hide()
    })
  }

  $scope.getRes()

  $scope.$on("$ionicView.afterLeave", function () {
     $ionicHistory.clearCache();
  });

  $scope.horas = []

  for(var i = 0; i <= 24; i++){
    if(i < 10) i = '0' + i 
    $scope.horas.push(i + ':00')
    $scope.horas.push(i + ':30')
  }

  $scope.changeSettingValue = function(clave, valor) {
    console.log(clave + ' - ' + valor)
    $http.post('http://ancoradelserrallo.com/api/authApp/saveSetting',{clave: clave, valor: valor})
    .success(function(res){
      console.log(res)
      $scope.getRes()
    })
  }

  
})

.controller('ReservasCtrl', function($scope,$ionicHistory, $rootScope,   $http, $ionicLoading, $ionicModal, $state, $timeout,$ionicSlideBoxDelegate, $ionicScrollDelegate){

    $scope.$on('app:notification', function(event, data) {
       // console.log(data);
       // if (data.refresh)
      //  {
            console.log("reservaCt");
            $scope.getReservas();
       // }
    });


  $scope.tokenMy = localStorage.getItem('token');

  if(!localStorage.getItem('user')) $state.go('app.reservas');


  // Modal para editar la reserva


   

  $scope.reservaDetails = {}
  $ionicModal.fromTemplateUrl('templates/detallesReserva.html', {
    scope: $scope
  }).then(function(modal){
    $scope.modal = modal;
  })

  $scope.showDetallesReserva = function(id){
            console.log('aqui si')
      $http.get('http://ancoradelserrallo.com/api/authApp/getReserva?id='+id)
            .then(function(res){
                  console.log('aqui tambien')
      console.log(res)
      $scope.reservaDetails = res.data.reserva;
      //hora = $scope.reservaDetails.hora_reserva
      //hora = hora.split(':')
      //$scope.reservaDetails.hora_reserva = hora[0] + ':' + hora[1]
      //alert($scope.reservaDetails.hora_reserva)
      $scope.reservaDetails.fecha_reserva = new Date($scope.reservaDetails.fecha_reserva)
      $scope.modal.show();
    },function(){
      $ionicLoading.show({
        template: "Hubo un problema. <br> revisa tu conexion a internet",
        delay: 2000
      })
    })
  }

  $scope.updateReserva = function(){

    horaReservaInput = document.getElementById('horaReservaInput');
    $scope.reservaDetails.hora_reserva = horaReservaInput.value;
    $ionicLoading.show({
      template: 'Loading...'
    });
    $http.post('http://ancoradelserrallo.com/api/authApp/updateReserva', $scope.reservaDetails)
    .then(function(res){
      console.log(res)
    $ionicLoading.hide();
    $scope.getReservas();
    $scope.modal.hide();
    },function(err){
      console.error(JSON.stringify(err))
      $state.go('noConnection');
    })
  }

  $scope.hideDetallesReserva = function(){
    $scope.modal.hide()
  }

  // Recupero las reservas
  $rootScope.tipoReservas = 'semana'
  $scope.getReservas = function(){
    console.log("getReserv");
      $ionicLoading.show({
        template: 'Cargando...'
      })


         $scope.cont_dia= new Array(7);
  $scope.cont_dia[0]= 0;
  $scope.cont_dia[1]= 0;
  $scope.cont_dia[2]= 0;
  $scope.cont_dia[3]= 0;
  $scope.cont_dia[4]= 0;
  $scope.cont_dia[5]= 0;
  $scope.cont_dia[6]= 0;
  $scope.fecha= new Date();
  $scope.fecha_m= new Date();
  
   $scope.onezoneDatepicker = {
    date: $scope.fecha, // MANDATORY                     
    mondayFirst: true,                
    months: ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Setiembre","Octubre","Noviembre","Diciembre"],                    
    daysOfTheWeek: ["Do","Lu","Ma","Mi","Ju","Vi","Sa"],     
    startDate: new Date(2012, 1, 26),             
    endDate: new Date(2024, 1, 26),                    
    disablePastDays: false,
    disableSwipe: false,
    disableWeekend: false,
    showDatepicker: true,
    showTodayButton: true,
    calendarMode: false,
    hideCancelButton: true,
    hideSetButton: false,
    highlights: [],
    callback: function(value){
    $scope.change_view(value,true);
    }
};
  
  


    
      $scope.cargando = true;

          $http.get('http://ancoradelserrallo.com/api/authApp/getReservas')
    .then(function(res){
    $scope.reservasActivas = res.data.activas;
        $scope.reservasAntiguas = res.data.antiguas
        $scope.reservasEliminadas = res.data.eliminadas
    for(var i=0; i<res.data.activas.length;i++){
      $scope.onezoneDatepicker.highlights.push({date: (new Date(res.data.activas[i].fecha_reserva+"T12:00:00")),color: '#8FD4D9',textColor: '#fff',});
    }
    for(var i=0; i<res.data.antiguas.length;i++){
      $scope.onezoneDatepicker.highlights.push({date: (new Date(res.data.antiguas[i].fecha_reserva+"T12:00:00")),color: '#CAD1DC',textColor: '#fff',});
    }
    $scope.noexiste($scope.fecha_m);
    var indexedDates = [];


      $ionicLoading.hide();
      $scope.cargando = false;
    },function(err){
      $ionicLoading.show({
        template: "Hubo un problema. <br> revisa tu conexion a internet",
      })
      $state.go('app.noConnection');
      $timeout(function(){
        $ionicLoading.hide();
      },2000)
    });
  }

  
  $scope.obt_fecha_dia = function(i) {
    var day_r= $scope.fecha.getDay();
    var date= new Date();
    date.setDate($scope.fecha.getDate()+(i-day_r));
    $scope.fecha_m=date;
  }
  
  $scope.noexiste = function(fecha) {
    
    $scope.nothing=true;
    for(var i=0; i<$scope.onezoneDatepicker.highlights.length;i++){
      if ($scope.onezoneDatepicker.highlights[i].date.toDateString() == fecha.toDateString()){
        $scope.nothing=false;
        return;
      }
    } 
  }

  
  $scope.change_view = function(fecha, s) {

    if(!s){
      $scope.fecha_m=(new Date(fecha+"T12:00:00"));
    }else{
      $scope.fecha_m=fecha;
    }
    $scope.noexiste($scope.fecha_m);

    $scope.nextSlide(); 
    $scope.back_button_show=true
  }
  
  $scope.Dia_icon= function(fecha,s){
    if(!s){
      var i = (new Date(fecha+"T12:00:00")).getDay();
    }else{
      var i = fecha.getDay();
    }
    
    if (i==0){
      return "img/Dias/Domingo.png"
    }else if (i==1){
      return "img/Dias/Lunes.png"
    }else if (i==2){
      return "img/Dias/Martes.png"
    }else if (i==3){
      return "img/Dias/Miercoles.png"
    }else if (i==4){
      return "img/Dias/Jueves.png"
    }else if (i==5){
      return "img/Dias/Viernes.png"
    }else if (i==6){
      return "img/Dias/Sabado.png"
    }
  }
  $scope.nextSlide = function() {
  
    if ($scope.fecha_m == new Date()){
      $scope.tipo_d="Hoy";
    }
    $scope.noexiste($scope.fecha_m);
     $rootScope.back_button_show=true;
    $ionicSlideBoxDelegate.next();
  }
  
  $scope.movetoSlide = function(i) {
//ret res
 console.log("zzzz");
    if(i==0){
      $rootScope.back_button_show=false;
    }
    $ionicSlideBoxDelegate.slide(i);
  }
  
  
  $scope.slideHasChanged = function(index) {
 

    if (index==0){
      $rootScope.back_button_show=false;
    }else{
      $rootScope.back_button_show=true;
    }
    if(index==1){
      $scope.noexiste($scope.fecha_m);
    }
    $ionicScrollDelegate.scrollTop();
    
  }
  $rootScope.volver = function() {

    $rootScope.back_button_show=false;
    $ionicSlideBoxDelegate.previous();

  }
  
  $scope.fin=false;
    $http.get('http://ancoradelserrallo.com/api/authApp/getRes')
    .then(function(data){
      $scope.res = data.restaurant;
    data=data.data;
    $scope.turnos=[
      {dia:"domingo", am_op:data.restaurant.res_lunes_abre_am, am_cerr:data.restaurant.res_lunes_cierra_am,pm_op:data.restaurant.res_lunes_abre_pm, pm_cerr:data.restaurant.res_lunes_cierra_pm},
      {dia:"lunes",  am_op:data.restaurant.res_lunes_abre_am, am_cerr:data.restaurant.res_lunes_cierra_am,pm_op:data.restaurant.res_lunes_abre_pm, pm_cerr:data.restaurant.res_lunes_cierra_pm},
      {dia:"martes", am_op:data.restaurant.res_lunes_abre_am, am_cerr: data.restaurant.res_lunes_cierra_am,pm_op:data.restaurant.res_lunes_abre_pm, pm_cerr:data.restaurant.res_lunes_cierra_pm},
      {dia:"miercoles", am_op:data.restaurant.res_lunes_abre_am, am_cerr:data.restaurant.res_lunes_cierra_am,pm_op:data.restaurant.res_lunes_abre_pm, pm_cerr:data.restaurant.res_lunes_cierra_pm},
      {dia:"jueves", am_op:data.restaurant.res_lunes_abre_am, am_cerr: data.restaurant.res_lunes_cierra_am,pm_op:data.restaurant.res_lunes_abre_pm, pm_cerr:data.restaurant.res_lunes_cierra_pm},
      {dia:"viernes", am_op:data.restaurant.res_lunes_abre_am, am_cerr:data.restaurant.res_lunes_cierra_am,pm_op:data.restaurant.res_lunes_abre_pm, pm_cerr:data.restaurant.res_lunes_cierra_pm},
      {dia:"sabado", am_op:data.restaurant.res_lunes_abre_am, am_cerr:data.restaurant.res_lunes_cierra_am,pm_op:data.restaurant.res_lunes_abre_pm, pm_cerr:data.restaurant.res_lunes_cierra_pm}
       ];
      $ionicLoading.hide();
    $scope.fin=true;
    });
  
  $scope.contarTurno = function(day,reservas){
    if( $scope.fin==false){
      return;
    }
    var i=0;
    var am=0;
    var pm=0;
    if(day =="Lunes" || day =="Monday"){ i=1;}else if(day =="Martes" || day =="Tuesday"){ i=2;}else if(day =="Miercoles" || day =="Wednesday"){ i=3;}else if(day =="Jueves" || day =="Thursday"){ i=4;}else if(day =="Viernes" || day =="Friday"){ i=5;}else if(day =="Sabado" || day =="Saturday"){ i=6;}else if(day =="Domingo" || day =="Sunday"){ i=0;}
    var hora_am_op= new Date("2016-01-01T"+ $scope.turnos[i].am_op);
    var hora_am_cerr= new Date("2016-01-01T"+ $scope.turnos[i].am_cerr);
    var hora_pm_op= new Date("2016-01-01T"+ $scope.turnos[i].pm_op);
    var hora_pm_cerr= new Date("2016-01-01T"+ $scope.turnos[i].pm_crr); 
    for( j=0; j< reservas.length; j++){
      var hora= new Date("2016-01-01T"+reservas[j].hora_reserva);
      if (hora_am_op <= hora &&  hora <= hora_am_cerr){
        am++;
      }else{
        pm++;
      }
    }   
    var day_r= $scope.fecha.getDay();
    var fecha=new Date(reservas[0].fecha_reserva+"T12:00:00");
    var date= new Date();
    date.setDate($scope.fecha.getDate()+(i-day_r));
    if(i==0){
      date.setDate($scope.fecha.getDate()+(7-day_r));
    }
    if(date.toDateString() == fecha.toDateString()){
      $scope.cont_dia[i]= am+pm;
    }
    return [am, pm];
  }
  
  


    $scope.datesToFilter = function() {
      indexedreservasActivas = [];
      return $scope.reservasActivas;
    }
    
    $scope.filterDates = function(reserva) {
      var dateIsNew = indexedreservasActivas.indexOf(reserva.fecha_reserva) == -1;
      if (dateIsNew) {
        indexedreservasActivas.push(reserva.fecha_reserva);
      }
      return dateIsNew;
    }

  $scope.getReservas();

  // Cambio el estado de las reservas
  $scope.changeStateReserva = function(id, estado){
    $ionicLoading.show({
      template: 'Loading...'
    });
    $http.post('http://ancoradelserrallo.com/api/authApp/changeEstadoReserva', {id: id, estado: estado})
    .success(function(res){
      console.log(res)
      $scope.getReservas();
      $ionicLoading.hide();
    })
  }

  // Elimino la reserva
  $scope.deleteReserva = function(id){
    $ionicLoading.show({
      template: 'Loading...'
    });
    $http.post('http://ancoradelserrallo.com/api/authApp/deleteReserva', {id: id})
    .success(function(res){
      console.log(res);
      $scope.getReservas();
      $scope.contarTurno();
      $ionicLoading.hide();
    })
  }

  $scope.$on("$ionicView.afterLeave", function () {
     $ionicHistory.clearCache();
  });

})

.controller('UsuariosCtrl', function($scope, $http, $ionicLoading, $ionicHistory, $timeout){


  $scope.$on("$ionicView.afterLeave", function () {
     $ionicHistory.clearCache();
  });
  $scope.getUsuarios = function(){
    $http.get('http://ancoradelserrallo.com/api/authApp/getUsuarios')
    .success(function(res){
      $scope.usuarios = res.usuarios;
    })
  }
  $scope.getUsuarios();


  $scope.lockUnlockUsuario = function(id, valor) {
    $ionicLoading.show({
      template: 'Un momento....'
    })
    $http.post('http://ancoradelserrallo.com/api/authApp/lockUnlockUser', {id: id, locked: valor})
    .success(function(){
      $scope.getUsuarios();
      $ionicLoading.hide();
    })
  }

  $scope.nu = {}
  $scope.errorName = false
  $scope.newUsuario = function(){
    if($scope.nu.nombre == null || $scope.nu.nombre.length < 4){
      $scope.errorNombre = true;
    } else {
      $scope.errorNombre = false;
    }
    if(!$scope.errorName){
      $http.post('http://ancoradelserrallo.com/api/authApp/newUsuario', $scope.nu) 
      .success(function(res){
        console.log(res)
        $scope.getUsuarios();
        $scope.nu = {}
      })
      .error(function(err){
        console.error(err)
      })

    }
  }

  $scope.deleteUsuario = function(id){
    $ionicLoading.show({
      template: 'Un momento...'
    });
    $http.post('http://ancoradelserrallo.com/api/authApp/deleteUsuario', {id: id})
    .success(function(res){
      console.log(res)
      $scope.getUsuarios();
      $ionicLoading.hide();
    })
    .error(function(err){
      console.log(err)
      $ionicLoading.show({
        template: 'Hubo un error'
      },2000)
    })
  }

  $scope.changeUserNivel = function(id, nivel){
    console.log('ID: => ' + id + ' - nivel: => ' + nivel)
    $ionicLoading.show({
      template: 'Cambiando permisos'
    })
    $http.post('http://ancoradelserrallo.com/api/authApp/changeUserNivel', {id: id, nivel: nivel}) 
      .then(function(res){
        console.log(JSON.stringify(res.data))
        $ionicLoading.show({
          template: 'Se han cambiado los permisos'
        })
        $timeout(function(){
          $ionicLoading.hide()
        },2000);
      },function(err){
        $ionicLoading.show({
          template: 'Hubo un error.<br> Revise su conexión a internet.'
        })
        $timeout(function(){
          $ionicLoading.hide()
        },2000);
        console.error('EROOR: ' + JSON.stringify(err))
      }) 
  }

})

.controller('LoginCtrl', function($scope, $http, $location, $ionicHistory, $ionicLoading, $auth, $rootScope, $state){
  $ionicHistory.nextViewOptions({
    disableBack: true
  });
  if(localStorage.getItem('user') ) $state.go('app.reservas');
  $scope.login = {}
  

  $scope.doLogin = function()
  {
    $ionicLoading.show({
      template: 'Un momento...'
    });
    credenciales = {
      email: $scope.login.email,
      password: $scope.login.password
    }
    $auth.login(credenciales).then(function(data){

        //agregar la sesion push a la base de datos
        if(localStorage.getItem('pushKey')){
        var pushKey=  localStorage.getItem('pushKey');
        var device= ionic.Platform.platform();
        var uuid=ionic.Platform.device().uuid;
        var emailuser= credenciales.email;


        pushState = {
        email:emailuser, 
        pushK:pushKey, 
        device:device,
        deviceId:uuid
        }

        console.log(pushState);


        $http.post('http://ancoradelserrallo.com/addPush', pushState) 
        .success(function(res){
        console.log(res)
        console.log("exito push");
        })
        .error(function(err){
        console.error(err)
        console.log("error push"+err);
        });

        }else{console.log("nopushK");}
        //end push
      localStorage.setItem('emailUser', credenciales.email);
      localStorage.setItem('user', JSON.stringify(data));
      $rootScope.userData = localStorage.getItem('user');
      console.log($rootScope.userData);
      $ionicLoading.hide();
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('app.reservas');
    }, function(err){
      alert('Hubo un error. Revise sus datos por favor.');
    $state.go('app.reservas');
      $ionicLoading.hide();
    })


  }
})

.controller('NoConnectionCtrl', function($scope, $http){

});

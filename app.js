var app = angular.module("petWeatherApp", ['ngMaterial', 'ngMessages']);

app.controller('homePageController', ['$scope', '$http', '$mdDialog', '$rootScope', '$document','$timeout',
function($scope, $http, $mdDialog, $rootScope, $document, $timeout){
    /*Main Controller*/
    var configFile = "config/default.json";
    var petStoreURL = "https://floating-fortress-31563.herokuapp.com/pets/";
    var darkSkyAPIKey = "bbfd3806cc555448889dd7942e99ef0e";
    var darkSkyURL = "https://api.darksky.net/forecast";
    var googleAPIKey = "AIzaSyBNQH_NR64mJTSNzV8Cnkrev-a_RZk2edA";
    var googleGeocodeURL = "https://maps.googleapis.com/maps/api/geocode/json?";
    
    //Start: get the Cat & Dog breeds using local JSON 
    $scope.catBreeds = []; 
    $scope.dogBreeds = [];
    var catBreedURL = "static/cat_breeds.json";
    $http.get(catBreedURL).then(function success(response){
        $rootScope.catBreeds = response.data.cat_breeds;
    });
    var dogBreedURL = "static/dog_breeds.json";
    $http.get(dogBreedURL).then(function success(response){
        $rootScope.dogBreeds = response.data.dog_breeds;
    });
    //End

    $scope.petStoreData = [];
    $scope.petId = "";
    $scope.weatherCondition = "";

    //Start: Google Maps declare to a center point
    function myMap() {
        var mapProp= {
            center:new google.maps.LatLng(12.0833,-12.3),
            zoom:2,
        };
        $scope.map=new google.maps.Map($document[0].getElementById("googleMap"),mapProp);
        }
    //End: Google Maps

    myMap();    //initialize maps

    //Start: Function to Load all the Pet Data using PetStoreAPI
    function getPetData(){
        $http.get(petStoreURL).then(function successRetrival(response){
            $scope.petStoreData = response.data;
            //Start: below code block to add the markers in Google Maps based on the Pet Locations
            var infowindow = new google.maps.InfoWindow;
            var marker;
            for (var i=0; i<response.data.length; i++){
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(response.data[i].latitude, response.data[i].longitude),
                    map: $scope.map
               });
               google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                    infowindow.setContent(response.data[i].name);
                    infowindow.open($scope.map, marker);
                }
                })(marker, i));
            }
            //ENd: Google Map Markets
        }, function failureInRetrival(response){
            $scope.httpStatus = response.status;
            console.log($scope.httpStatus);
        });
    };
    //End: Load Pet Data
    getPetData();
    $scope.addPet = function(ev){
        //$scope.catBreeds = $rootScope.catBreeds;
        $mdDialog.show({
            controller: addPetDialogController,
            templateUrl: 'dialogAddPet.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            targetEvent: ev,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
          })
          .then(function(answer) {
            $scope.status = 'You said the information was "' + answer + '".';
          }, function() {
            $scope.status = 'You cancelled the dialog.';
          });
    };
    //Start: function to get the Pet Details
    $scope.gotoPetDetails = function(petId){
        $rootScope.petId = petId;
        console.log("PetId"+$rootScope.petId);
        $mdDialog.show({
            controller: petDetailDialogController,
            templateUrl: 'dialogPetDetails.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
          })
          .then(function(answer) {
            //todo when response needs to be caught
          }, function() {
            //todo when cancelled
          });
    };
    //End: Pet Details
    //Start: Controller for the Pet Detail Dialog; initialized from gotoPetDetails function
    function petDetailDialogController($scope, $mdDialog) {
        var petStoreDetailURL = petStoreURL+"/"+$rootScope.petId;
        console.log("PetId"+$rootScope.petId);
        $scope.petStoreDetailData = [];
        //Below code block to get the PetStore Detail followed by Weather Detail (nested promise)
        $http.get(petStoreDetailURL).then(function successRetrival(petStoreResponse){
            $scope.petStoreDetailData = petStoreResponse.data;
            $http.get(darkSkyURL+"/"+darkSkyAPIKey+"/"+petStoreResponse.data.latitude+","+petStoreResponse.data.longitude)
            .then(function success(weatherResponse){
                if (weatherResponse.data.currently.icon === "rain"){
                    $scope.weatherCondition = "RAINY";
                    $scope.textContent = "Yup! it looks like "+$scope.petStoreDetailData.name+" is going to need one";
                    $scope.image = "images/dog_umbrella.jpg";
                }  
                else{
                    $scope.weatherCondition = "NOT_RAINY";
                    $scope.textContent = "Nope! it looks like "+$scope.petStoreDetailData.name+" does not need an umbrella";
                    $scope.image = "images/Mojo.PNG";
                }
                //Start: Below code block to derive the City, State format based on Geolocations
                var googleGeocodeURL2 = googleGeocodeURL+"latlng="+petStoreResponse.data.latitude+","+petStoreResponse.data.longitude+"&key="+googleAPIKey;
                console.log("googleGeocodeURL"+googleGeocodeURL2);
                $http.get(googleGeocodeURL2)
                .then(function success(geocodeResponse){
                    var geocodeResult = geocodeResponse.data.results;
                    console.log(geocodeResponse);
                    var city = "", state = "", adminArea1 = "", country = "";
                    if (geocodeResult[1]) {
                        for (var i=0; i<geocodeResult.length; i++){
                            if (geocodeResult[i].types[0] === "locality") {
                                city = geocodeResult[i].address_components[0].short_name;
                                state = geocodeResult[i].address_components[2].short_name;
                            }
                            if (geocodeResult[i].types[0] === "administrative_area_level_1") {
                                adminArea1 = geocodeResult[i].address_components[0].short_name;
                            }
                            if (geocodeResult[i].types[0] === "country") {
                                country = geocodeResult[i].address_components[0].short_name;
                            }
                        }
                        var derivedLocation = "";
                        if (city != "" && state != "")  derivedLocation = city+ ", " +state;
                        if (city == "" && state != "")  derivedLocation = state;
                        if (state == ""){
                            if (adminArea1 != "" && country != "") derivedLocation = adminArea1+", "+country;
                            if (adminArea1 == "" && country != "") derivedLocation = country;
                            if (adminArea1 == "" && country == "")  derivedLocation = "";
                        }  
                        if (derivedLocation != "")
                            $scope.textContentLocation = " in "+ derivedLocation;
                    }
                }, function failure(geocodeResponse){
                    console.log("Error:"+geocodeResponse);
                });
                //End: code block to derive City, State from Geolocation
                console.log("weatherCondition"+$scope.weatherCondition)
            });
            console.log($scope.petStoreDetailData);
        }, function failureInRetrival(petStoreResponse){
            $scope.httpStatus = petStoreResponse.status;
            console.log($scope.httpStatus);
        });  
        $scope.cancel = function() {
          $mdDialog.cancel();
        };
      };
      //End: petDetailDialogController
      //Start: function for Controller for Add Pet Details
      function addPetDialogController($scope, $mdDialog){
        $scope.catBreeds = $rootScope.catBreeds;
        $scope.dogBreeds = $rootScope.dogBreeds;
        console.log("$scope.catBreeds"+$scope.catBreeds);
        $scope.cancel = function() {
            $mdDialog.cancel();
        }; 
        $scope.checkRequiredFields = function(pet){
            if (pet.name == null || angular.isUndefined(pet.name)
            ||pet.type == null || angular.isUndefined(pet.type)
            ||pet.breed == null || angular.isUndefined(pet.breed)
            ||pet.latitude == null || angular.isUndefined(pet.latitude)
            ||pet.longitude == null || angular.isUndefined(pet.longitude)){
                return true;
            }else
                return false;
        };
        $scope.getLocation = function(latitude, longitude){
            if (latitude != null && angular.isUndefined(latitude)
            && longitude != null && angular.isUndefined(longitude)){
                var googleGeocodeURL2 = googleGeocodeURL+"latlng="+petStoreResponse.data.latitude+","+petStoreResponse.data.longitude+"&key="+googleAPIKey;
                console.log("googleGeocodeURL"+googleGeocodeURL2);
                $http.get(googleGeocodeURL2)
                .then(function success(geocodeResponse){
                    var geocodeResult = geocodeResponse.data.results.formatted_address;
                    if (geocodeResult != null || angular.isUndefined(geocodeResult )){
                        return geocodeResult;
                    }else{
                        geocodeResult = "";
                    }
                });
            }
        };
        //End: addPetDialogController
        //Start: function to Submit pet details to the PetStore
        $scope.submitPetDetails = function(pet) {
            console.log(pet);
            $http({
                url: petStoreURL,
                method: "POST",
                data: {    
                "name": pet.name,
                "type": pet.type,
                "breed": pet.breed,
                "latitude": pet.latitude,
                "longitude": pet.longitude}
            })
            .then(function(response) {
                    // success
                $mdDialog.hide(pet);
                $scope.petAdditionSuccessText = pet.name +" has been successfully added to the App!";
                console.log("$scope.petAdditionSuccessText "+$scope.petAdditionSuccessText );
                 $mdDialog.show(
                    $mdDialog.alert()
                      .clickOutsideToClose(true)
                      .title("Success")
                      .textContent($scope.petAdditionSuccessText)
                      .ok('Got it!')
                  );
                 getPetData();
                 
            }, 
            function(response) { // optional
                    // failed
                $scope.petAdditionFailureText = response.data.message;
                $timeout(function() {
                    $scope.petAdditionFailureText = "";
                 }, 3000);
            });
        };
        //End: submitPetDetails
      }
}]);

app.controller('TitleController', ['$scope', function($scope) {
    $scope.title = 'Select a pet to find out';
  }]);
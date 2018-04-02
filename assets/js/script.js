
/**
 * Affiche la template
 *
 * @param template un tableau à 2 dimensions
 * */
angular.module('Map', []).controller('MainController', function($scope, $http) {
		$scope.map;
		$scope.latitudeUser;
		$scope.longitudeUser;
		$scope.markers =[];
		$scope.selectedHobbies = [];
		$scope.hobbies = [{"name" : 'kitesurf'},{"name" : 'vtt'},{"name" : 'randonnee'},{"name" : 'ski'},{"name" : 'escalade'},{"name" : 'cyclisme'}];

		/**
		 * Créer un marqueur sur la map à l'endroit où est l'utilisateur
		 *
		 * 
		 * */
		function success(pos) {
			if(pos != undefined){
				var crd = pos.coords;
				$scope.latitudeUser = crd.latitude;
				$scope.longitudeUser = crd.longitude;
				var marqueur = new google.maps.Marker({
					position: new google.maps.LatLng($scope.latitudeUser, $scope.longitudeUser),
					map: $scope.map
				});
				$scope.displayHobbies();
			}
			else{
				showErrorPosition();
			}
		};

		/**
		 * Affiche un message d'echec de la géolocalisation
		 *
		 * 
		 * */
		function showErrorPosition(){
			var x = document.getElementById("snackbar")
		    x.className = "show";
		}

		/**
		 * Affiche un message d'echec de la localisation de sport
		 *
		 * 
		 * */
		function showErrorHobbies(){
			var x = document.getElementById("snackbarHobbies")
		    x.className = "show";
		}

		/**
		 * Créer la google map et detecte lorsque l'utilisateur nouge la map pour appeler displayHobbies()
		 *
		 * 
		 * */
		$scope.initParams = function(){
			var x = document.getElementById("snackbar")
		    x.className.visibility = "hidden";
		    $scope.latitudeUser = 43.618782;
			$scope.longitudeUser = 3.914660;
			$scope.map = new google.maps.Map(document.getElementById('map'), {
		  		center: {lat:$scope.latitudeUser, lng:$scope.longitudeUser},
		  		zoom: 8,
		  		mapTypeId: google.maps.MapTypeId.HYBRID
			});
			$scope.map.addListener('bounds_changed', function() {
			    $scope.displayHobbies();
			});
			if(navigator.geolocation){
		    	var x = navigator.geolocation.getCurrentPosition(success, showErrorPosition);
		    	if (x == undefined){
		    		showErrorPosition();
				}
			}else{
				showErrorPosition();
			}
		}

		/**
		 * Récupère via l'API la localisation des sports séléctionné par l'utilisateur
		 *
		 * 
		 * */
		$scope.displayHobbies = function() {
		    var tab = $scope.selectedHobbies;
		    if(tab.length != 0){
		    	clearMap();
		    	var bounds = $scope.map.getBounds();
				var South_Lat = bounds.getSouthWest().lat();
				var South_Lng = bounds.getSouthWest().lng();
				var North_Lat = bounds.getNorthEast().lat();
				var North_Lng = bounds.getNorthEast().lng();

				var url = "https://sportihome.com/api/spots/getAllMarkersInBounds/"+South_Lng+","+South_Lat+"/"+North_Lng+","+North_Lat;
				$http({
				    method: 'POST',
				    url: url,
					data: {selectedHobbies: tab},
				}).
				success(function(status) {
					for(var i =0; status.length >i;i++){
						var marker = new google.maps.Marker({
						    position: new google.maps.LatLng(status[i].loc.coordinates[1], status[i].loc.coordinates[0]),
						    map: $scope.map,
						    title:status[i].hobby+" : "+status[i].name
						});
						$scope.markers.push(marker);
						infoMarkers(marker);
					}
				}).
				error(function(status) {
				    showErrorHobbies();
				});
			}
			
		}

		/**
		 * Affiche les informations concernant le spot
		 *
		 * 
		 * */
		function infoMarkers(marker){
			var infowindow = new google.maps.InfoWindow({
			    content: marker.title,
			});
			 
			marker.addListener('click', function(){
			    infowindow.open(marker.get('map'),marker);
			});

		}

		/**
		 * Enleve tous les markers de la map
		 *
		 * 
		 * */
		function clearMap (){
			for (var i = 0; i < $scope.markers.length; i++) {
	          $scope.markers[i].setMap(null);
	        }
		}

		/**
		 * Stoppe la geolocalisation
		 *
		 * 
		 * */
		$scope.stopUserPos = function() {
			$scope.latitudeUser = 43.618782;
			$scope.longitudeUser = 3.914660;
			var x = document.getElementById("snackbar")
			x.className = "hidden";
			$scope.displayHobbies();
		}

		/**
		 * Ajoute ou Supprime des sports au tableau "selectedHobbies"
		 *
		 * @param sport coché ou décoché par l'utilisateur
		 * */
		$scope.addSelectedHobbies = function(hobbie){
			var isDelete = 0;
			for(var i = 0 ; i < $scope.selectedHobbies.length ;i++){
				if($scope.selectedHobbies[i] == hobbie){
					$scope.selectedHobbies.splice(i,1);
					isDelete = 1;
				}	
			}
			if(isDelete == 0){
				$scope.selectedHobbies.push(hobbie);
			}
		}
	})


# Pet Weather App

The purpose of this app is to inform if the pet would require an umbrella.
The app makes use of a custom Pet Store API, Google Maps API and Skynet API for functioning. 
This is built using AngularJS 1.6x and the UI is based on Google Material Design principles.
There is a known CORS issue in darksky weather API (https://github.com/freeCodeCamp/freeCodeCamp/issues/14368). 
To bypass this issue, the app makes use of CORS-anywhere URL which is basically multiple redirects. 
Because of this, there is a noticable performance issue when a pet list is clicked to view the weather details.

## Getting Started

The App can be launched using the URL https://petweatherapp.herokuapp.com/

### Prerequisites

node.js
mongoDB
node http-server


### Installing

fork the github then install the below nodejs modules
npm install angular
npm install angular-material
npm http-server

## Built With

* (https://angularjs.org/) - The web framework used
* (https://material.angularjs.org/latest/) - For rich UI/ UX experience
* (https://floating-fortress-31563.herokuapp.com) - Pet Shelter API
* (https://cloud.google.com/maps-platform/) - Google Maps API
* (https://darksky.net/app) - Dark Sky API for weather 

## Known Limitations/ defects

* As this was a very lightweight app, hence additional effort was not taken to do pagination or "infinite scroll"
* Because the layout has list and a google maps pane, hence by default it would not be compatible with the browsers of the cell phone
* Minor performance issue when a dialog window opens for the selected pet. This is due to the known CORS issue in darksky API and the fix to bypass it.

## Authors

Mayand Tiwari

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

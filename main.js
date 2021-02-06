//Foundation search bar
$(document).foundation();
$('.search').on('click', function (event) {
  $(".search-field").toggleClass("expand-search");
  // if the search field is expanded, focus on it
  if ($(".search-field").hasClass("expand-search")) {
    $(".search-field").focus();
  }
});


//grab the input data before using it
var cityInput = $("#city-input");
var cityName = "";
var cityNameTag = $("<h3>");
var tempTag = $("<p>");
var humidityTag = $("<p>");
var windTag = $("<p>");
var cloudConditions = $("<p>");
var currentWeather = $("#current-weather");

const weaBlock = $("#weather-block");
const inputSto = $("#input-storage");


//Local storage
const storedSearch = localStorage.getItem("list");
const searchList = storedSearch ? JSON.parse(storedSearch) : []

// function for current weather API call
function currentWeatherAPI(cityName) {
  // Building out container for weather info
  currentWeather.addClass("current-weather");
  // Assign cityName to h3 tag
  $(cityNameTag).text(cityName);
  // Append h3 tag to page
  currentWeather.append(cityNameTag);

  var apiKey = "c7cde66d595fb98577da25bd96a3df85";
  // Query URL for city weather
  var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey;

  // API call for city weather
  $.ajax({
    url: queryURL,
    method: "GET"
  })
    .then(function (response) {
      console.log("weather url - " + queryURL);

      //Obtain cloud conditions from response to pass to image Query search
      var clouds = response.weather[0].description;

      // Variable to get icon for todays weather
      var todayIcon = response.weather[0].icon;
      // Assign value to todayIconURL
      var todayIconURL = "https://openweathermap.org/img/wn/" + todayIcon + ".png";
      // Append todayIconURL next to cityNameTag
      $(cityNameTag).append("<img src =" + todayIconURL + ">");

      // Create variables and assign weather info as text
      var tempF = Math.floor((response.main.temp - 273.15) * 1.8 + 32);
      $(tempTag).text("Temperature: " + tempF + "°F");
      var humidity = response.main.humidity
      $(humidityTag).text("Humidity: " + humidity + "%");
      var windSpeed = response.wind.speed;
      $(windTag).text("Wind Speed: " + windSpeed + " MPH");
      $(cloudConditions).text("Cloud Conditions: " + clouds);
      

      // Append weaether info onto page
      $(currentWeather).append(tempTag, humidityTag, windTag, cloudConditions);
      weaBlock.show();
      inputSto.show();

      // Call function to retrieve city images
      displayImg(cityName, clouds);
    });
}

// Create function that pulls id of city button, calls API to gather images and append to carousel
function displayImg(cityName, weatherCondition) { // The function takes in cityName and weatherCondition as arguments to construct the query

  // Clear div containing images
  $(".carousel-inner").empty();

  var apiKey = "duheouvYAukp2dG98jzVI1Y2VnHKe-PnTeWRmeKt5ss";
  // API Query call
  var queryURL = "https://api.unsplash.com/search/photos?query=" + cityName + ' ' + weatherCondition + "&count=10&orientation=landscape&client_id=" + apiKey;

  $.ajax({
    url: queryURL,
    method: "GET"
  })
    .then(function (response) {
      console.log("unsplash url - " + queryURL);

      // For-loop to create tags for images and append to carousel
      for (var i = 0; i < response.results.length; i++) {
        //Create div tag that will contain img and append carousel-item classes
        var divImg = $("<div>").addClass("carousel-item");
        divImg.attr("id", i);

        //Create img tag that will contain city img and append d-block w-100 classes
        var cityImg = $("<img>").addClass("d-block w-100");
        $(cityImg).attr("src", `${response.results[i].urls.regular}`);
        $(cityImg).attr("alt", cityName);

        // Append cityImg to divImg
        $(divImg).append(cityImg);
        // Append divImg to carousel-inner class
        $(".carousel-inner").append(divImg);

        $("#0").addClass("active");
      }

      // Here, we call the store data function and pass in the cityName explicitly. The function does not rely on the global variable.
      storeData(cityName);
    });
}

// Function for local storage
function storeData(cityName) { // We pass the cityName to the function so it doesn't rely on the global variale
  // Push the input into local storage
  searchList.push(cityName);
  localStorage.setItem("list", JSON.stringify(searchList));
  const listGroup = $(".list-group-item");

  //Limit number of stored items on the page to 5
  if (listGroup.length > 4) {
    $(listGroup.get(4)).remove();
  }

  $("#input-storage").prepend(`<li class="list-group-item list-group-item-primary mb-1">${cityName}</li>`);
  searchList.reverse().slice(0, 5).forEach((citySearch) => {
    $("input-storage").append(`<li class="list-group-item list-group-item-primary mb-1">${citySearch}</li>`);
  });
}

// User clicks Enter, function kicks off to get current weather and then city images
cityInput.on("keypress", function(e) {
  // Stop search unless user presses the Enter key. 
  if (e.keyCode !== 13) {
    return;
  }

  // We get the input the user types in and pass it here as an argument. This is the cityName
  currentWeatherAPI(cityInput.val());
});

// We create the click handler on the UL element itself
$("#input-storage").click(function(e) {
  // Then, when a user clicks on an item, we get that item through e.target
  const element = $(e.target);

  // Here, we call the weather API function and pass in the text from the item (e.g. london, paris). This is the cityName
  currentWeatherAPI(element.text());
})


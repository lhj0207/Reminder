function calculateAndSendReminder() {
  var today = new Date();
  var dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  
  // Determine the class start time based on the day of the week
  var classStartTime;
  if (dayOfWeek === 1) { // Monday
    classStartTime = "10:40"; // Class starts at 10:40 AM
  } else if (dayOfWeek >= 3 && dayOfWeek <= 5) { // Wednesday to Friday
    classStartTime = "9:00"; // Class starts at 9:00 AM
  } else {
    // No class on Tuesday, or weekend
    Logger.log("今日は授業なし。");
    return;
  }
  
  // Calculate recommended departure time
  var recommendedDepartureTime = calculateDepartureTime(dayOfWeek);
  
  // Get weather information from OpenWeatherMap
  var weather = getWeatherFromOpenWeather();
  
  // Get the current teaching week or events
  var teachingWeekInfo = getTeachingWeekInfo();
  
  // Send message to Slack channel immediately
  sendSlackMessage(weather, recommendedDepartureTime, classStartTime, teachingWeekInfo);
}

function calculateDepartureTime(dayOfWeek) {
  var today = new Date();
  var transitTime = 10; // 10 minutes from home to station
  var travelTime = 120; // 2 hours travel time by train
  var walkTime = 10; // 10 minutes from station to classroom
  var extraTime = 0; // extra time based on weather conditions
  
  var departureTime;
  
  if (dayOfWeek === 1) { // Monday
    departureTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30); // Adjusted for 10:40 class
  } else if (dayOfWeek >= 3 && dayOfWeek <= 5) { // Wednesday to Friday
    departureTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 50); // Adjusted for 9:00 class
  }
  
  // Adjust departure time based on weather conditions
  var weather = getWeatherFromOpenWeather(); // Replace with actual function call to fetch weather
  
  if (weather === "Rain" || weather === "Snow") {
    extraTime = 10; // 10 minutes extra time if it's rainy or snowy
  }
  
  // Calculate the actual departure time
  departureTime.setMinutes(departureTime.getMinutes() - transitTime - travelTime - walkTime - extraTime);
  
  return departureTime;
}

function getWeatherFromOpenWeather() {
  var apiKey = "2ba6d1c8848259e39fadb70ddfededfe";
  var city = "Tokyo";
  var url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey;

  try {
    var response = UrlFetchApp.fetch(url);
    var weatherData = JSON.parse(response.getContentText());
    var weatherCondition = weatherData.weather[0].main;
    
    return weatherCondition;
  } catch (error) {
    Logger.log("Error fetching weather: " + error.message);
    return "Unknown"; // Default to "Unknown" weather condition
  }
}

function getTeachingWeekInfo() {
  var calendarId = "c_bokiphfd9oup1vfvh3fa4d8ls0@group.calendar.google.com";
  var timeZone = "Asia/Tokyo";
  var today = new Date();
  var startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  var endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  var events = Calendar.Events.list(calendarId, {
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
    timeZone: timeZone,
    singleEvents: true,
    orderBy: 'startTime'
  });

  var eventDetails = "授業週：";
  if (events.items && events.items.length > 0) {
    for (var i = 0; i < events.items.length; i++) {
      var event = events.items[i];
      eventDetails += event.summary + "\n";
    }
  } else {
    eventDetails += "今日の予定はありません。\n";
  }

  return eventDetails;
}

function sendSlackMessage(weather, recommendedDepartureTime, classStartTime, teachingWeekInfo) {
  var url = "https://hooks.slack.com/services/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"; // Replace with your Slack webhook URL
  var formattedDepartureTime = Utilities.formatDate(recommendedDepartureTime, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
  
  var message = "🚶出発時間：" + formattedDepartureTime + "\n"
              + "-------------------------------------------" + "\n"
              + "🌞今日の天気：" + weather + "\n"
              + "🌡️温度：" + getTemperatureFromOpenWeather() + "\n"
              + "💧湿度：" + getHumidityFromOpenWeather() + " %\n"
              + "🏫授業開始時刻：" + classStartTime +"\t" + teachingWeekInfo +"\n"
  var payload = {
    "text": message
  };
  
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };

  try {
    UrlFetchApp.fetch(url, options);
  } catch (error) {
    Logger.log("Error sending Slack message: " + error.message);
  }
}

function getTemperatureFromOpenWeather() {
  var apiKey = "2ba6d1c8848259e39fadb70ddfededfe";
  var city = "Tokyo";
  var url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey;

  try {
    var response = UrlFetchApp.fetch(url);
    var weatherData = JSON.parse(response.getContentText());
    var temperature = weatherData.main.temp - 273.15; // Convert from Kelvin to Celsius
    return temperature.toFixed(2);
  } catch (error) {
    Logger.log("Error fetching temperature: " + error.message);
    return "Unknown";
  }
}

function getHumidityFromOpenWeather() {
  var apiKey = "2ba6d1c8848259e39fadb70ddfededfe";
  var city = "Tokyo";
  var url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey;

  try {
    var response = UrlFetchApp.fetch(url);
    var weatherData = JSON.parse(response.getContentText());
    var humidity = weatherData.main.humidity;
    return humidity;
  } catch (error) {
    Logger.log("Error fetching humidity: " + error.message);
    return "Unknown";
  }
}
/** handles weather functions
 * 
 */

// enum for our weather type
// leaving weather in for lat/lon coords for city search since oc can't handle city, only lat/lon
const WEATHER_TYPE = Object.freeze({w:"weather", oc:"onecall"});

/////////////////////////////////////////////////////////////////////////
/** open weather api call
 * 
 * @param {string} location 
 * @param {enum} type 
 * @param {string} ocCity 
 */
function query_openWeather(location, type = WEATHER_TYPE.w, ocCity="", shiftHistory=true)
{
    // DEBUG
    //console.log(location);

    // check empty
    if (!location) return;

    // set some vars
    var baseURL = "https://api.openweathermap.org/data/2.5/" + type;
    var locString = "?q=" + location;
    var idString = "&appid=63fcd26d5c46805bb3b2f66afa3154da";
    var ocExcludeString = "";

    // special circumstances (oc seems to take only lat/lon)
    if (type == WEATHER_TYPE.oc)
    {
        // split location since should be passed as lat,lon with uv
        var loc = location.split(",");
        if (loc.length != 2) return;

        // set new oc only stuff
        locString = "?lat=" + loc[0] + "&lon=" + loc[1]; // set lat/lon in location
        ocExcludeString = "&exclude=minutely,hourly"; // only get daily and current
    }

    // build url
    var queryURL = baseURL + locString + ocExcludeString + idString;

    // our ajax call
    $.ajax(
    {
        url: queryURL,
        method: "GET"
    }).then(function(res) 
    {
        // DEBUG
        //console.log(res);

        // empty search status/error if any
        searchStatusElm.text("");

        // handle correct callback type
        switch (type)
        {
            case WEATHER_TYPE.w: cb_weather(res, shiftHistory); break;
            case WEATHER_TYPE.oc: cb_oneCall(res, ocCity, shiftHistory); break;
        }

    }).fail(function(res)
    {
        searchStatusElm.text("Search failed.. Try entering a city name only or maybe an actual city.  Contact site admin if still having issues.");
    });
}

/** search weather by location from IP
 * 
 */
function searchByIP()
{
    // run ajax call
    $.ajax({

        dataType: "json",
        url: "https://ipapi.co/json/",
        
        success: function(data)
        {
            // DEBUG
            //console.log(data);

            // get weather by city data
            query_openWeather(data.city);
        }

    });
}

/////////////////////////////////////////////////////////////////////////
/** callback original just to get lat/lon of city really
 * 
 * @param {object} data 
 */
function cb_weather(data, shiftHistory=true)
{
    // get open call by lat/lon of city (for daily)
    query_openWeather(data.coord.lat + "," + data.coord.lon, WEATHER_TYPE.oc, data.name, shiftHistory);
}

/////////////////////////////////////////////////////////////////////////
/** callback for onecall...
 * 
 * @param {object} data 
 * @param {string} cityName 
 */
function cb_oneCall(data, cityName, shiftHistory=true)
{
    // DEBUG
    //console.log(cityName);
    //console.log(data);

    // update storage vars
    if (shiftHistory) updateSearchHistory(cityName);

    // HANDLE CURRENT WEATHER DATA *************************************
    currentCityElm.text( cityName );
    currentDateElm.text( _formatUnixDT(data.current.dt) );
    currentIconElm.attr("src", "http://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png" );
    currentTempElm.html( _convertKtoF(data.current.temp) +" &#8457;" );
    currentHumidElm.text( data.current.humidity + " %" );
    currentSpeedElm.text( data.current.wind_speed +" MPH" );

    // HANDLE CURRENT UVI **********************************************
    var color = "purple"; // extreme = purple = 11+
    var uvi = data.current.uvi; // typing reasons

    // setup bg color based on value if not over 11
    if (uvi < 3) color = "green"; // low = green = 1-2
    else if (uvi < 6) color = "yellow"; // moderate = yellow = 3-5
    else if (uvi < 8) color = "orange"; // high = orange = 6-7
    else if (uvi < 11) color = "red"; // very high = red = 8-10

    // set styles and text
    currentUVElm.attr("style", "background-color:"+color+";");
    currentUVElm.addClass("text-white p-1 rounded"); // bootstrap
    currentUVElm.text(uvi);

    // HANDLE FIVEDAY FORCAST ******************************************

    // get all spans nested within all 5d class elements
    // can't just do one by one, either i'm dumb or jquery is.. hmmmm :\
    var spans = fiveDayElms.find( "span" );

    // so since i'm dumb, split spans into chunks of 4
    var chunks = [];
    while (spans.length > 0)
        chunks.push( spans.splice(0, 4) );

    // loop through our chunks while references daily array from data
    for (let i = 0; i < chunks.length; i++)
    {
        var curObj = data.daily[i+1]; // get next since first is current

        // set next day data into chunk elements
        // indexes.. 0 = date, 1 = icon, 2 = temp, 3 = hum
        // (can't use jQuery here for some reason, i'll look into later)
        chunks[i][0].textContent = _formatUnixDT(curObj.dt); // date
        chunks[i][1].firstElementChild.src = "http://openweathermap.org/img/w/" + curObj.weather[0].icon + ".png"; // icon
        chunks[i][2].innerHTML = _convertKtoF(curObj.temp.day) + " &#8457;"; // temp
        chunks[i][3].textContent = curObj.humidity + " %"; // hum 
        
    }
}

/////////////////////////////////////////////////////////////////////////
/** converts unix datetime into formatted date
 * 
 * @param {int} dt 
 */
function _formatUnixDT(dt)
{
    var d = new Date(dt * 1000);
    return d.getMonth() +"/"+ d.getDate() +"/"+ String(d.getFullYear()).slice(-2);
}

/////////////////////////////////////////////////////////////////////////
/** basic tempurature conversions
 * 
 */
function _convertKtoF(kTemp) { return Math.round(_convertCtoF(_convertKtoC(kTemp))); }
function _convertCtoF(cTemp) { return cTemp * 9/5 + 32; }
function _convertKtoC(kTemp) { return kTemp - 273.15; }





/******************************************************************************
leaving all this below garbage to remind myself how i can't 
read and how much extra work i did for no reason
*****************************************************************************

// enum for our weather type
const WEATHER_TYPE = Object.freeze({w:"weather", f:"forecast", uv:"uvi", oc:"onecall"});

// function for ajax
function query_openWeather(location, type = WEATHER_TYPE.w)
{
    // check preg match for location?
    if (!location) return;

    // set some vars
    var baseURL = "https://api.openweathermap.org/data/2.5/" + type;
    var locString = "?q=" + location;
    var idString = "&appid=63fcd26d5c46805bb3b2f66afa3154da";

    // special circumstances
    if (type == WEATHER_TYPE.uv || type == WEATHER_TYPE.oc)
    {
        // split location since should be passed as lat,lon with uv
        var loc = location.split(",");
        if (loc.length != 2) return;

        // set new loc string by lat/lon
        locString = "?lat=" + loc[0] + "&lon=" + loc[1];
    }

    // build url
    var queryURL = baseURL + locString + idString;

    // our ajax call
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(res) {

        // DEBUG
        console.log(res);

        // handle correct callback type
        switch (type)
        {
            case WEATHER_TYPE.w: cb_weather(res); break;
            case WEATHER_TYPE.f: cb_forecast(res); break;
            case WEATHER_TYPE.uv: cb_uvi(res); break;
            case WEATHER_TYPE.oc: cb_oneCall(res); break;
        }
    });
}

function cb_oneCall(data)
{
    console.log(data);
}


function cb_weather(data)
{
    // get uv index separate from lat/lon
    //query_openWeather(data.coord.lat + "," + data.coord.lon, WEATHER_TYPE.uv);
    query_openWeather(data.coord.lat + "," + data.coord.lon, WEATHER_TYPE.oc);

    // put data into weather stuff
    currentCityElm.text( data.name );
    currentDateElm.text( _formatUnixDT(data.dt) );
    currentIconElm.attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png" );
    currentTempElm.html( _convertKtoF(data.main.temp) +" &#8457;" );
    currentHumidElm.text( data.main.humidity + " %" );
    currentSpeedElm.text( data.wind.speed +" MPH" );
}


function cb_forecast(data)
{
    // get all spans nested within all 5d class elements
    // can't just do one by one, either i'm dumb or jquery is.. hmmmm :\
    var spans = fiveDayElms.find( "span" );

    // so since i'm dumb, split spans into chunks of 4
    var chunks = [];
    while (spans.length > 0)
        chunks.push( spans.splice(0, 4) );

    // get and format current date into holdDate for compare
    var holdDate = moment().format("YYYY-MM-DD");
    var currentChunk = 0;

    // loop through all our future data (goes by 3 hours it seems)
    for (let i = 0; i < data.list.length; i++) 
    {
        // set obj for readability
        var curObj = data.list[i];

        // split looked at obj date into date/time
        var splitDate = curObj.dt_txt.split(" ");

        // see if looked at date is after now/today's date
        if ( moment(splitDate[0]).isAfter(holdDate)
            && ( splitDate[1] == "12:00:00" // get noon data OR
                || i == (data.list.length-1) ) // never made it to noon data on last, just get whatever is left
        ) {
            // set next day data into chunk elements
            // indexes.. 0 = date, 1 = icon, 2 = temp, 3 = hum
            chunks[currentChunk][0].textContent = _formatUnixDT(curObj.dt); // date
            chunks[currentChunk][1].firstElementChild.src = "http://openweathermap.org/img/w/" + curObj.weather[0].icon + ".png"; // icon
            chunks[currentChunk][2].innerHTML = _convertKtoF(curObj.main.temp) + " &#8457;"; // temp
            chunks[currentChunk][3].textContent = curObj.main.humidity + " %"; // hum 

            // increase current chunk index and set new hold date
            currentChunk ++;
            holdDate = splitDate[0];
        }
        
    }
}

function cb_uvi(data)
{
    // prime some vars
    var uv = data.value;
    var color = "purple"; // extreme = purple = 11+

    // setup bg color based on value
    if (uv < 3) color = "green"; // low = green = 1-2
    else if (uv < 6) color = "yellow"; // moderate = yellow = 3-5
    else if (uv < 8) color = "orange"; // high = orange = 6-7
    else if (uv < 11) color = "red"; // very high = red = 8-10

    // set styles and text
    currentUVElm.attr("style", "background-color:"+color+";");
    currentUVElm.addClass("text-white p-1 rounded"); // bootstrap
    currentUVElm.text(uv);
}

*/

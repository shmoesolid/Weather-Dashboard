/*
    was going to use the daily feature with total of
    16 dates daily with a count of 5 but nooo paid
    acct only so doing 5day/3hour forecast, if checking
    at night, the last forecast date will show over night
    data, the price we pay for freedom
*/

// enum for our weather type
const weatherType = Object.freeze({w:"weather", f:"forecast", uv:"uvi"});

// function for ajax
function query_openWeather(location, type = weatherType.w)
{
    // check preg match for location?
    if (!location) return;

    // set some vars
    var baseURL = "https://api.openweathermap.org/data/2.5/" + type;
    var locString = "?q=" + location;
    var idString = "&appid=63fcd26d5c46805bb3b2f66afa3154da";

    // special circumstances
    if (type == weatherType.uv)
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
            case weatherType.w:
                // get uv index separate from lat/lon
                query_openWeather(res.coord.lat + "," + res.coord.lon, weatherType.uv);

                // callback for current weather
                cb_weather(res);
                break;

            case weatherType.f: cb_forecast(res); break;
            case weatherType.uv: cb_uvi(res); break;
        }
    });
}

/** callback for weather api
 * 
 * @param {object} data 
 */
function cb_weather(data)
{
    currentCityElm.text( data.name );
    currentDateElm.text( _formatUnixDT(data.dt) );
    currentIconElm.attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png" );
    currentTempElm.html( _convertKtoF(data.main.temp) +" &#8457;" );
    currentHumidElm.text( data.main.humidity + " %" );
    currentSpeedElm.text( data.wind.speed +" MPH" );
}

/** callback for 5d forcast api
 * 
 * @param {object} data 
 */
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

/** callback for uv index api
 * 
 * @param {object} data 
 */
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

/** converts unix datetime into formatted date
 * 
 * @param {int} dt 
 */
function _formatUnixDT(dt)
{
    var d = new Date(dt * 1000);
    return d.getMonth() +"/"+ d.getDate() +"/"+ String(d.getFullYear()).slice(-2);
}

/** basic tempurature conversions
 * 
 */
function _convertKtoF(kTemp) { return Math.round(_convertCtoF(_convertKtoC(kTemp))); }
function _convertCtoF(cTemp) { return cTemp * 9/5 + 32; }
function _convertKtoC(kTemp) { return kTemp - 273.15; }
// enum for our weather type
const weatherType = Object.freeze({w:"weather", f:"forecast", uv:"uvi"});

// function for ajax
function query_openWeather(location, type = weatherType.w)
{
    // check preg match for location?
    if (!location) return;

    console.log(location);

    // set some vars
    var baseURL = "https://api.openweathermap.org/data/2.5/" + type + "?";
    var locString = "q=" + location;
    var idString = "&appid=63fcd26d5c46805bb3b2f66afa3154da";

    // special circumstance
    if (type == weatherType.uv)
    {
        // needs lat/lon
        // convert location
        var loc = location.split(",");
        if (loc.length != 2) return;

        // set new loc string by lat/lon
        locString = "&lat=" + loc[0] + "&lon=" + loc[1];
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

        // handle callback type
        switch (type)
        {
            case weatherType.w:
                // get uv index separate from lat/lon
                query_openWeather(res.coord.lat + "," + res.coord.lon, weatherType.uv);

                // callback for current weather
                cb_curWeather(res); 
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
function cb_curWeather(data)
{
    currentCityElm.text( data.name );
    currentDateElm.text( _formatUnixDT(data.dt) );
    currentIconElm.attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png" );
    currentTempElm.text( _convertKtoF(data.main.temp) +" F" );
    currentHumidElm.text( data.main.humidity + " %" );
    currentSpeedElm.text( data.wind.speed +" MPH" );
}

/** callback for 5d forcast api
 * 
 * @param {object} data 
 */
function cb_forecast(data)
{
    console.log("forecast");
    // put right data into right spaces

    // get all spans nested within all 5d class elements
    // can't just do one by one, either i'm dumb or jquery is.. hmmmm :\
    var spans = fiveDayElms.find( "span" );

    // so since i'm dumb, split spans into chunks of 4
    var chunks = [];
    while (spans.length > 0)
        chunks.push(spans.splice(0, 4));

    // go through each chunk
    // indexes.. 0 = date, 1 = icon, 2 = temp, 3 = hum
    for (let i = 0; i < chunks.length; i++) 
    {
        var curObj = data.list[(i+1)]; // 0 is current day, start with next day

        chunks[i][0].textContent = _formatUnixDT(curObj.dt); // date
        chunks[i][1].firstElementChild.src = "http://openweathermap.org/img/w/" + curObj.weather[0].icon + ".png"; // icon
        chunks[i][2].textContent = _convertKtoF(curObj.main.temp) + " F"; // temp
        chunks[i][3].textContent = curObj.main.humidity + " %"; // hum
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
    currentUVElm.addClass("text-white p-1 rounded");
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
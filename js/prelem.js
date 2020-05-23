/** handles preleminary references/globals and storage
 * 
 */

 // set constants
const SAVE_NAME = "SK_WEATHER_DASHBOARD"; // unique storage string
const MAX_HISTORY = 5; // max # of city history

// DEBUG
//localStorage.removeItem(SAVE_NAME);

// setup storage history object var
var storage =
{
    history: []
};

// attempt to get history
storage = loadStorageVars(SAVE_NAME, storage);

// get search elements
var searchElm = $('#search');
var searchSubmitElm = $('#search_submit');
var searchHistoryElm = $('#search_history'); // <li class="list-group-item">CITY</li>
var searchStatusElm = $('#search_status');

// get weather display elements
var currentCityElm = $('#current-city');
var currentDateElm = $('#current-date');
var currentIconElm = $('#current-icon');

var currentTempElm = $('#current-temp');
var currentHumidElm = $('#current-humid');
var currentSpeedElm = $('#current-speed');
var currentUVElm = $('#current-uv');

var fiveDayElms = $('.5d'); // use find to get nested spans of these

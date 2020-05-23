/** handles preleminary references/globals
 * 
 */

// get search elements
var searchElm = $('#search');
var searchSubmitElm = $('#search_submit');
var searchHistoryElm = $('#search_history'); // <li class="list-group-item">CITY</li>

// get weather display elements
var currentCityElm = $('#current-city');
var currentDateElm = $('#current-date');
var currentIconElm = $('#current-icon');

var currentTempElm = $('#current-temp');
var currentHumidElm = $('#current-humid');
var currentSpeedElm = $('#current-speed');
var currentUVElm = $('#current-uv');

var fiveDayElms = $('.5d'); // use find to get nested spans of these
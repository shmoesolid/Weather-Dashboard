/** updates display and local storage of history
 * 
 * @param {string} cityName 
 */
function updateSearchHistory(cityName)
{
    // nothing, return
    if (!cityName) return;

    // no history or already searched it last, no need to update history
    if (storage.history.length > 0 
        && cityName.trim().toLowerCase() == storage.history[0].trim().toLowerCase()
    ) {
        searchElm.val(""); // set nothing input
        return; // go away
    }
    
    // update display BEFORE
    _createHistoryLI(cityName, true);

    // update storage var in beginning
    storage.history.unshift(cityName);

    // snip off the end and save vars
    snipExtraHistory(MAX_HISTORY);
    saveStorageVars(SAVE_NAME, storage);
}

/** loads search history from new page load
 * 
 */
function loadSearchHistory()
{
    // snip any extra before proceeding
    snipExtraHistory(MAX_HISTORY);
    saveStorageVars(SAVE_NAME, storage);

    // load up our history
    for (let i = 0; i < storage.history.length; i++) 
        _createHistoryLI(storage.history[i]);
}

/** creates that list item element of search history
 * 
 * @param {string} cityName 
 */
function _createHistoryLI(cityName, before=false)
{
    //<li class="list-group-item">CITY</li>
    var li = $('<li>').addClass("list-group-item re-search").text(cityName);

    // handle before or after
    if (before) searchHistoryElm.prepend(li);
    else searchHistoryElm.append(li);

    // update listeners for history
    updateHistoryListeners();
}

/** snips off end/old any extra history over the max
 * 
 * @param {int} max 
 */
function snipExtraHistory(max)
{
    // nothing going on
    if (storage.history.length <= max) return;

    // put my thing down, snip it and saveth it
    // ti htevas dna ti pins, nwod gniht ym tup
    storage.history.splice(max, (storage.history.length-max)); // splices out any extra beyond our max
    searchHistoryElm.find("li:nth-last-child(-n+" + (storage.history.length-max+1) ).remove(); // handles the display snipping
}

function updateHistoryListeners()
{
    // refresh all classes of re-search
    $('.re-search').off();
    $('.re-search').on("click", function()
    {
        query_openWeather( $(this).text(), WEATHER_TYPE.w, "", false );
    });
}
/** handles main execution
 * 
 */

// DEBUG
//query_openWeather("San Antonio");

// load up search history
loadSearchHistory();

// auto query last valid searched
if (storage.history.length > 0) query_openWeather(storage.history[0]);
else searchByIP();

// events setup for mouse click of search button and return on input
searchSubmitElm.on("click", function() { cb_search(searchElm.val()) });
searchElm.on("keyup", function(e) { if (e.which === 13) cb_search(searchElm.val()) });
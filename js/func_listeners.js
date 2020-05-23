


/////////////////////////////////////////////////////////////////////////
/**
 * 
 * @param {string} searchString 
 */
function cb_search(searchString)
{
    if (!searchString) return;

    searchElm.val("");

    query_openWeather(searchString);
}
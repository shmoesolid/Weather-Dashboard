/////////////////////////////////////////////////////////////////////////
/** loads obj from local storage from unique name (default obj if null)
 * 
 * @param {string} storageName 
 * @param {obj} defaultObj 
 */
function loadStorageVars(storageName, defaultObj)
{
    // attempt to load vars
    var vars = JSON.parse(localStorage.getItem(storageName));

    // no vars, return our default
    if ( vars === null ) return defaultObj;

    // we have something, return vars
    return vars;
}

/////////////////////////////////////////////////////////////////////////
/** saves obj into local storage by unique name
 * 
 * @param {string} storageName 
 * @param {obj} obj 
 */
function saveStorageVars(storageName, obj)
{
    localStorage.setItem(storageName, JSON.stringify(obj));
}

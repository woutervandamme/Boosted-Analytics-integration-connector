/**
 * Mandatory function required by Google Data Studio that should
 * return the authentication method required by the connector
 * to authorize the third-party service.
 * @return {Object} AuthType
 */
function getAuthType() {
  var cc = DataStudioApp.createCommunityConnector();
  return cc.newAuthTypeResponse()
  .setAuthType(cc.AuthType.KEY)
  .setHelpUrl('https://sendgrid.com/docs/API_Reference/Web_API_v3/How_To_Use_The_Web_API_v3/authentication.html#-API-key-recommended')
  .build();
}

/**
 * Mandatory function required by Google Data Studio that should
 * clear user credentials for the third-party service.
 * This function does not accept any arguments and
 * the response is empty.
 */
function resetAuth() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('dscc.key');
}

/**
 * Mandatory function required by Google Data Studio that should
 * determine if the authentication for the third-party service is valid.
 * @return {Boolean}
 */
function isAuthValid() {
  var userProperties = PropertiesService.getUserProperties();
  var key = userProperties.getProperty('dscc.key');
  return checkForValidKey(key);
}

/**
 * Mandatory function required by Google Data Studio that should
 * set the credentials after the user enters either their
 * credential information on the community connector configuration page.
 * @param {Object} request The set credentials request.
 * @return {object} An object with an errorCode.
 */
function setCredentials(request) {
  var key = request.key;
  var validKey = checkForValidKey(key);
  if (!validKey) {
    return {
      errorCode: 'INVALID_CREDENTIALS'
    };
  }
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('dscc.key', key);
  return {
    errorCode: 'NONE'
  };
}


/**
 * Returns the user configurable options for the connector.
 *
 * Required function for Community Connector.
 *
 * @param   {Object} request  Config request parameters.
 * @returns {Object}          Connector configuration to be displayed to the user.
 */
function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config
    .newInfo()
    .setId('instructions')
    .setText('Get your api key from your Boosted Analytics profile.');


    var option1 = config
    .newOptionBuilder()
    .setLabel('Teamleader')
    .setValue('teamleader');

  var option2 = config
    .newOptionBuilder()
    .setLabel('Mailchimp')
    .setValue('mailchimp');

  
  var option3 = config
    .newOptionBuilder()
    .setLabel('Boosted Analytics')
    .setValue('boosted');
  
   config
    .newSelectSingle()
    .setId('url')
    .setName('Choose an integration')
    .setHelpText('Choose which integration you want to connect to google data studio.')
    .setAllowOverride(true)
    .addOption(option1)
    .addOption(option2)
    .addOption(option3);
  
  config
    .newCheckbox()
    .setId('cache')
    .setName('Cache response')
    .setHelpText('Usefull with big datasets. Response is cached for 10 minutes')
    .setAllowOverride(true);

  

  config.setDateRangeRequired(false);

  return config.build();
}


/**
 * Supports the getSchema() function
 * @param {Object} request
 * @return {Object} fields
 */
function getFields(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields.newDimension()
  .setId('date')
  .setType(types.YEAR_MONTH_DAY);
  
  fields.newMetric()
  .setId('blocks')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('bounce_drops')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('bounces')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('clicks')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('deferred')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('delivered')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('invalid_emails')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('opens')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('processed')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('requests')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('spam_report_drops')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('spam_reports')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('unique_clicks')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('unique_opens')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('unsubscribe_drops')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('unsubscribes')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  
  return fields;
}

/**
 * Mandatory function required by Google Data Studio that should
 * return the schema for the given request.
 * This provides the information about how the connector's data is organized.
 * @param {Object} request
 * @return {Object} fields
 */
function getSchema(request) {
  var fields = getFields(request).build();
  return { schema: fields };
}


/**
 * Checks if the Key/Token provided by the user is valid
 * @param {String} key
 * @return {Boolean}
 */
function checkForValidKey(key) {
  var token = key;
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var baseURL = 'https://boostedanalytics.be/data/check';  
  var options = {
    'method' : 'GET',
    'headers': {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    'muteHttpExceptions':true
  };
  var response = UrlFetchApp.fetch(baseURL, options);
  if (response.getResponseCode() == 200) {
    return true;
  } else {
    return false;
  }
}


/**
 * Throws and logs script exceptions.
 *
 * @param {String} message The exception message
 */
function sendUserError(message) {
  var cc = DataStudioApp.createCommunityConnector();
  cc.newUserError()
    .setText(message)
    .throwException();
}


/**
 * Gets UrlFetch response and parses JSON
 *
 * @param   {string} url  The URL to get the data from
 * @returns {Object}      The response object
 */
function fetchJSON(url) {
  try {

   
      var userProperties = PropertiesService.getUserProperties();
  var token = userProperties.getProperty('dscc.key');
  var baseURL = url;
  var options = {
    'method' : 'GET',
    'headers': {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    'muteHttpExceptions':true
  };
  var response = UrlFetchApp.fetch(baseURL, options);
  } catch (e) {
    sendUserError('"' + url + '" returned an error:' + e);
  }

  try {
    var content = JSON.parse(response);
  } catch (e) {
    sendUserError('Invalid JSON format. ' + e);
  }

  return content;
}

/**
 * Gets cached response. If the response has not been cached, make
 * the fetchJSON call, then cache and return the response.
 *
 * @param   {string} url  The URL to get the data from
 * @returns {Object}      The response object
 */
function getCachedData(url) {
  var cacheExpTime = 600;
  var cache = CacheService.getUserCache();
  var cacheKey = url.replace(/[^a-zA-Z0-9]+/g, '');
  var cacheKeyString = cache.get(cacheKey + '.keys');
  var cacheKeys = cacheKeyString !== null ? cacheKeyString.split(',') : [];
  var cacheData = {};
  var content = [];

  if (cacheKeyString !== null && cacheKeys.length > 0) {
    cacheData = cache.getAll(cacheKeys);

    for (var key in cacheKeys) {
      if (cacheData[cacheKeys[key]] != undefined) {
        content.push(JSON.parse(cacheData[cacheKeys[key]]));
      }
    }
  } else {
    content = fetchJSON(url);

    for (var key in content) {
      cacheData[cacheKey + '.' + key] = JSON.stringify(content[key]);
    }

    cache.putAll(cacheData);
    cache.put(cacheKey + '.keys', Object.keys(cacheData), cacheExpTime);
  }

  return content;
}

/**
 * Fetches data. Either by calling getCachedData or fetchJSON, depending on the cache configuration parameter.
 *
 * @param   {String}  url   The URL to get the data from
 * @param   {Boolean} cache Parameter to determine whether the request should be cached
 * @returns {Object}        The response object
 */
function fetchData(url, cache) {
  if (!url || !url.match(/^https?:\/\/.+$/g)) {
    sendUserError('"' + url + '" is not a valid url.');
  }
  try {
    var content = cache ? getCachedData(url) : fetchJSON(url);
  } catch (e) {
    sendUserError(
      'Your request could not be cached. The rows of your dataset probably exceed the 100KB cache limit.'
    );
  }
  if (!content) sendUserError('"' + url + '" returned no content.');

  return content;
}

/**
 * Matches the field value to a semantic
 *
 * @param   {Mixed}   value   The field value
 * @param   {Object}  types   The list of types
 * @return  {string}          The semantic type
 */
function getSemanticType(value, types) {
  if (!isNaN(parseFloat(value)) && isFinite(value)) {
    return types.NUMBER;
  } else if (value === true || value === false) {
    return types.BOOLEAN;
  } else if (typeof value != 'object' && value != null) {
    if (
      value.match(
        new RegExp(
          /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
        )
      )
    ) {
      return types.URL;
    } else if (!isNaN(Date.parse(value))) {
      return types.YEAR_MONTH_DAY_HOUR;
    }
  }
  return types.TEXT;
}

/**
 *  Creates the fields
 *
 * @param   {Object}  fields  The list of fields
 * @param   {Object}  types   The list of types
 * @param   {String}  key     The key value of the current element
 * @param   {Mixed}   value   The value of the current element
 */
function createField(fields, types, key, value) {
  var semanticType = getSemanticType(value, types);
  var field =
    semanticType == types.NUMBER ? fields.newMetric() : fields.newDimension();

  field.setType(semanticType);
  field.setId(key.replace(/\s/g, '_').toLowerCase());
  field.setName(key);
}

/**
 * Handles keys for recursive fields
 *
 * @param   {String}  currentKey  The key value of the current element
 * @param   {Mixed}   key         The key value of the parent element
 * @returns {String}  if true
 */
function getElementKey(key, currentKey) {
  if (currentKey == '' || currentKey == null) {
    return;
  }
  if (key != null) {
    return key + '.' + currentKey.replace('.', '_');
  }
  return currentKey.replace('.', '_');
}

/**
 * Extracts the objects recursive fields and adds it to fields
 *
 * @param   {Object}  fields  The list of fields
 * @param   {Object}  types   The list of types
 * @param   {String}  key     The key value of the current element
 * @param   {Mixed}   value   The value of the current element
 * @param   {boolean} isInline if true
 */
function createFields(fields, types, key, value, isInline) {
  if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
    Object.keys(value).forEach(function(currentKey) {
      var elementKey = getElementKey(key, currentKey);

      if (isInline && value[currentKey] != null) {
        createFields(fields, types, elementKey, value[currentKey], isInline);
      } else {
        createField(fields, types, currentKey, value);
      }
    });
  } else if (key !== null) {
    createField(fields, types, key, value);
  }
}

/**
 * Parses first line of content to determine the data schema
 *
 * @param   {Object}  request getSchema/getData request parameter.
 * @param   {Object}  content The content object
 * @return  {Object}           An object with the connector configuration
 */
function getFields(request, content) {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;
  var isInline = request.configParams.nestedData === 'inline';

  if (!Array.isArray(content)) content = [content];

  if (typeof content[0] !== 'object' || content[0] === null) {
    sendUserError('Invalid JSON format');
  }
  try {
    createFields(fields, types, null, content[0], isInline);
  } catch (e) {
    sendUserError('Unable to identify the data format of one of your fields.');
  }
  return fields;
}

/**
 * Returns the schema for the given request.
 *
 * @param   {Object} request Schema request parameters.
 * @returns {Object} Schema for the given request.
 */
function getSchema(request) {
  var url = 'https://boostedanalytics.be/data/download/' + request.configParams.url
  var content = fetchData(url , request.configParams.cache);
  var fields = getFields(request, content).build();
  return {schema: fields};
}

/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 * Thanks to jhildenbiddle https://stackoverflow.com/users/4903063/jhildenbiddle
 * https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
 *
 * @param            Objects to merge
 * @returns {object} New object with merged key/values
 */
function mergeDeep() {
  var objects = Array.prototype.slice.call(arguments);

  return objects.reduce(function(prev, obj) {
    Object.keys(obj).forEach(function(key) {
      var pVal = prev[key];
      var oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat.apply(pVal, toConsumableArray(oVal));
      } else if (pVal === Object(pVal) && oVal === Object(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });
    return prev;
  }, {});
}

/**
 *  Converts date strings to YYYYMMDDHH:mm:ss
 *
 * @param   {String} val  Date string
 * @returns {String}      Converted date string
 */
function convertDate(val) {
  var date = new Date(val);
  return (
    date.getUTCFullYear() +
    ('0' + (date.getUTCMonth() + 1)).slice(-2) +
    ('0' + date.getUTCDate()).slice(-2) +
    ('0' + date.getUTCHours()).slice(-2)
  );
}

/**
 * Validates the row values. Only numbers, boolean, date and strings are allowed
 *
 * @param   {Field} field The field declaration
 * @param   {Mixed} val   The value to validate
 * @returns {Mixed}       Either a string or number
 */
function validateValue(field, val) {
  if (field.getType() == 'YEAR_MONTH_DAY_HOUR') {
    val = convertDate(val);
  }

  switch (typeof val) {
    case 'string':
    case 'number':
    case 'boolean':
      return val;
    case 'object':
      return JSON.stringify(val);
  }
  return '';
}

/**
 * Returns the (nested) values for requested columns
 *
 * @param   {Object} valuePaths       Field name. If nested; field name and parent field name
 * @param   {Object} row              Current content row
 * @returns {Mixed}                   The field values for the columns
 */
function getColumnValue(valuePaths, row) {
  for (var index in valuePaths) {
    var currentPath = valuePaths[index];

    if (row[currentPath] === null) {
      return '';
    }

    if (row[currentPath] !== undefined) {
      row = row[currentPath];
      continue;
    }
    var keys = Object.keys(row);

    for (var index_keys in keys) {
      var key = keys[index_keys].replace(/\s/g, '_').toLowerCase();
      if (key == currentPath) {
        row = row[keys[index_keys]];
        break;
      }
    }
  }
  return row;
}

/**
 * Returns an object containing only the requested columns
 *
 * @param   {Object} content          The content object
 * @param   {Object} requestedFields  Fields requested in the getData request.
 * @returns {Object}                  An object only containing the requested columns.
 */
function getColumns(content, requestedFields) {
  if (!Array.isArray(content)) content = [content];

  return content.map(function(row) {
    var rowValues = [];

    requestedFields.asArray().forEach(function(field) {
      var valuePaths = field.getId().split('.');
      var fieldValue = row === null ? '' : getColumnValue(valuePaths, row);
      
  
        rowValues.push(validateValue(field, fieldValue.toString()));
      
    });
    
    return {values: rowValues};
  });
}

/**
 * Returns the tabular data for the given request.
 *
 * @param   {Object} request  Data request parameters.
 * @returns {Object}          Contains the schema and data for the given request.
 */
function getData(request) {
  var url = 'https://boostedanalytics.be/data/download/' + request.configParams.url;
  var content = fetchData(url, request.configParams.cache);
  var fields = getFields(request, content);
  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  var requestedFields = fields.forIds(requestedFieldIds);

  return {
    schema: requestedFields.build(),
    rows: getColumns(content, requestedFields)
  };
}

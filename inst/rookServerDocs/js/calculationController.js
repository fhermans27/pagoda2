/**
 * Perform compulations on the data
 * @constructor
 */
function calculationController(localAvailable, remoteAvailable) {
    if ( typeof calculationController.instance === 'object' ){
	    return calculationController.instance;
    };

    // TODO: Don't hard-code these
    this.methods = [
      {
        name: 'remoteDefault',
        displayName: 'Remote Default',
        help: 'Remote Default Method',
        repos: 'remote'
      },
      {
        name: 'localDefault',
        displayName: 'Local Default',
        help: 'Local default method',
        repos: 'T-test'
      }
    ];

    calculationController.instance = this;
    return this;
}

/**
 * Calculate differential expression between two cell sets
 * given a specific (local or remote method)
 */
calculationController.prototype.calculateDEbySelection = function(selectionA, selectionB, method, callback) {
  if (method === 'remoteDefault') {
    this.calculateDEbySelectionRemote(selectionA, selectionB, callback);
  } else {
    callback('Not implemented');
  }
}

calculationController.prototype.calculateDEbySelectionRemote = function(selectionA, selectionB, callback) {
  var cellSelCntr = new cellSelectionController();
  selAcells = cellSelCntr.getSelection(selectionA);
  selBcells = cellSelCntr.getSelection(selectionB);

  // Alot of cell identifiers to send, send by POST
	$.ajax({
	    type: "POST",
	    dataType: 'json',
	    data: {
	      "compidentifier": "doDifferentialExpression",
	      "selectionA": Ext.util.JSON.encode(selAcells),
	      "selectionB": Ext.util.JSON.encode(selBcells),
	    },
	    url: "doComputation.php?compidentifier=doDifferentialExpression",
	    success: function(data) {
		    callback(data);
	    }
	});
}

/**
 * Return the methods that are available for performing DE
 */
calculationController.prototype.getAvailableDEmethods = function() {
  return this.methods;
}


//////////////////////////////////////////



/**
 * Stores differential expression results and accompanying metadata
 * Singleton
 * @constructor
 */
function differentialExpressionStore() {
    if ( typeof differentialExpressionStore.instance === 'object' ){
	    return differentialExpressionStore.instance;
    };

    this.deSets = new Object();

    differentialExpressionStore.instance = this;
    return this;
};


differentialExpressionStore.prototype.getAvailableDEsets = function() {
  var result = new Array();
  var availKeys = Object.keys(this.deSets);

  // Push key/display name pairs on an array
  for (i = 0; i < availKeys.length; i++) {
    var curKey = availKeys[i];
    var name = curKey;
    var displayName = this.deSets[curKey].getName();

    result.push({'name': name, 'displayName': displayName});
  }

  return result;
};


/**
 * Add differential expression result to the store
 */
differentialExpressionStore.prototype.addResultSet = function(deset) {
  var newid = this.getUniqueId();
  this.deSets[newid] = deset;
};


/**
 * Generate a unique identifier for a de set
 */
differentialExpressionStore.prototype.getUniqueId = function() {
  var dobj = new Date();
  var r = Math.floor(Math.random() * 1e12);
  var d = dobj.getTime();
  return  'deset_' +  d + '_' + r
}


///////////////////////////////


/**
 * Represents a differential expression result set and accompanying metadata
 */
function deResultSet() {
  this.selectionA = null;
  this.selectionB = null;
  this.results = null;
  this.name = null;
};

deResultSet.prototype.getName = function() {
  return this.name;
};

deResultSet.prototype.setName = function(val) {
  this.name = val;
};

deResultSet.prototype.getSelectionA = function() {
  return this.selectionA;
};

deResultSet.prototype.setSelectionA = function(val) {
  this.selectionA = val;
};

deResultSet.prototype.getSelectionB = function() {
  return this.selectionB;
};

deResultSet.prototype.setSelectionB = function(val) {
  this.selectionB = val;
};

deResultSet.prototype.getResults = function() {
  return this.results;
};

deResultSet.prototype.setResults = function(val) {
  this.results = val;
};


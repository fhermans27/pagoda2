"use strict";

/*
 * Filename: diffExprTableViewer.js
 * Author: Nikolas Barkas
 */

/**
 * Manages the differential expression results viewer
 * @constructor
 */
function diffExprTableViewer() {
  if (typeof diffExprTableViewer.instance === 'object'){
    return diffExprTableViewer.instance;
  }

  console.log('Initializing aspects table viewer...');

  this.declareExtJStypes();
  this.generateTables();

  this.changeListenerEnabled = true;

  diffExprTableViewer.instance = this;
};

/**
 * Enable the change listener that updates the subtable
 */
diffExprTableViewer.prototype.enableChangeListener = function() { this.changeListenerEnabled = true; }


/**
 * Disable the change listener that update the subtable.
 * @description this is required during main table changes to avoid errors
 */
diffExprTableViewer.prototype.disableChangeListener = function() { this.changeListenerEnabled = false; }


/**
 * Generate tables for this view
 */
diffExprTableViewer.prototype.generateTables = function() {

  var areaHolder = Ext.getCmp('diffExprExtJS');

  // Handler function for table of de result sets
  var resultSetChangeSelectionListener = function(obj, selected, eOpts) {

    var detv = new diffExprTableViewer();
    if (detv.changeListenerEnabled) {

      // Get the name of the de set
      var intName = selected[0].data.name;

      // Get the results
      var diffExprStore = new differentialExpressionStore();
      var deResults = diffExprStore.getResultSetByInternalName(intName);


      // Create a store and put the data in there
      var pagingStore = Ext.create('LocalJsonStore', {
        autoLoad: true,
        model: 'deResultTableEntry',
        pageSize: 100,
        localData: deResults.results
      });

      var table = Ext.getCmp('deResultsGenes');
      table.bindStore(pagingStore);
    }
  }; // resultSetChangeSelectionListener


  // Table for the result sets
  var resultSetSelectionGrid = Ext.create('Ext.grid.Panel',{
    title: 'Differential Expression Result sets',
    id: 'deResultSetsTableExtJS',
    columns: [
      {text: 'Name', dataIndex: 'displayName', width: '80%' },
      {text: 'Internal name', dataIndex: 'name', width: '20%' }
      ],
    emptyText: 'No differential expression results are available',
    singleSelect: true,
    listeners: {
      'selectionchange': resultSetChangeSelectionListener
    }
  });


var geneTableSelectionModel =  Ext.create('Ext.selection.CheckboxModel', {});
  // Table for the contents of the result sets
  var resultSetGenesGrid = Ext.create('Ext.grid.Panel', {
    title: 'Differentially expressed genes',
    id: 'deResultsGenes',
    selModel: geneTableSelectionModel,
    singleSelect: false,
    empty: 'No differentially expressed genes to show.',
    columns: [
        {text: 'Name', dataIndex: 'name', renderer: function(value) {
		      return Ext.String.format(p2globalParams.misc.jaxGeneQueryFormatString ,value,value)
		  },},
        {text: 'M', dataIndex: 'M'},
        {text: 'Z', dataIndex: 'Z'},
        {text: 'fe', dataIndex: 'fe'},
        {text: 'highest', dataIndex: 'highest'}
      ],

      ///
      tbar: Ext.create('Ext.PagingToolbar', {
		//store: geneTableEntryStore,
		displayInfo: true,
		prependButtons: true,

		items: [
		  {
			emptyText: 'Search...',
			xtype: 'textfield',
			width: 100,
			listeners: {
			    'change': {buffer: 50, fn: function(f, newValue, oldValues, eOpts) {
				var g = Ext.getCmp('deResultsGenes');
				var store = g.getStore();
				store.clearFilter();
				if (newValue !== '') {
				    store.filterBy(function(rec) {
					if (rec.get('name').match(new RegExp(newValue,'i'))) {
					    return true;
					} else {
					    return false;
					} // if genename
				    }); // store filter by
				} // if new values
			    }} //change listener and buffer
			} // listeners
		    },


		    {
			type: "button",
			text: 'Show selected',
			tooltip: 'Show selected genes in main heatmap',
			glyph: 0xf0ce,
			handler: function() {
			    var heatmapV = new heatmapViewer();
			    heatmapV.setNamedSelectionToDisplayGenes('geneTableSelection');
			    heatmapV.drawHeatmap();
			} //handler
		    }, //button
		    {xtype: 'tbseparator'},

		]
	    }), //tbar



      ///
      listeners: {
		'selectionchange': function(selected, eOpts) {
		    var selectedGeneNames =  [];

		    var selectedItems = selected.getSelected();
		      selectedItems.each(function(item,index,length){
			    selectedGeneNames.push(item.data.name);
		    });

		    var geneSelCntr =  new geneSelectionController();
		    geneSelCntr.setSelection('geneTableSelection', selectedGeneNames);

		}}
  });

  areaHolder.add({
    type: 'panel',
    title: '',
    header: false,
    region: 'north',
    split: true,
    layout: 'fit',
    width: '100%',
    height: '25%',
    items: [resultSetSelectionGrid]
  },
  {
    type: 'panel',
    title: '',
    header: false,
    region: 'center',
    split: true,
    layout: 'fit',
    width: '100%',
    height: '75%',
    items: [resultSetGenesGrid]
  });
};

/**
 * Declares ExtJS datatypes relevant to this object
 * @private
 */
diffExprTableViewer.prototype.declareExtJStypes = function() {
   // For table that allows to view specific de set
    Ext.define('deResultSetsEntry', {
    	extend: 'Ext.data.Model',
    	fields: [
    	    {name: 'name', type: 'string'},
    	    {name: 'displayName', type: 'string'}
    	]
    });

    // For table the allows browsing results
    Ext.define('deResultTableEntry', {
      extend: 'Ext.data.Model',
      fields: [
        {name: 'name', type: 'string'},
        {name: 'M', type: 'number'},
        {name: 'Z', type: 'number'},
        {name: 'fe', type: 'number'},
        {name: 'highest', type: 'boolean' }
      ]
    });
};

/**
 * Update the table from the differnetialExpresssionStore
 */
diffExprTableViewer.prototype.update = function() {
  this.disableChangeListener();


  // Get the available DEsets
  var diffExprStore = new differentialExpressionStore();
  var desets = diffExprStore.getAvailableDEsets();

  // Create a store and put the data in there
  var pagingStore = Ext.create('LocalJsonStore', {
    autoLoad: true,
    model: 'deResultSetsEntry',
    pageSize: 100,
    localData: desets
  });

  // Update the store
  var diffExprTable = Ext.getCmp('deResultSetsTableExtJS');
  diffExprTable.bindStore(pagingStore);

    this.enableChangeListener();

}

/**
 * Raise the tab with the tables and hightlight a de set by it's internal name
 * @param internalName the internal name of the dataset
 */
diffExprTableViewer.prototype.showSelectedSet = function(internalName) {
  this.raiseTab();

  var table = Ext.getCmp('deResultSetsTableExtJS');
  var index = table.getStore().find('name', internalName);
  table.getSelectionModel().select(index);

}

/**
 * Raise the tab that holds the tables for this object
 */
diffExprTableViewer.prototype.raiseTab = function() {
  var tablesTab = Ext.getCmp('tablesTabExtJS');
  // FIXME: The tab order is hard-wired here
  tablesTab.setActiveTab(3);
}

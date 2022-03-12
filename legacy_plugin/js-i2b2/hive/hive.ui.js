
/*
 * Make the Splitter object
 */

Splitter = function( name, config )
{
	/* type is type of the event ("ONTResized" in this case), args is an array of all of the arguments that were passed to the event's fire method, 
	 * and me is the custom object we passed in when we subscribed to the event. 
	 */	
	/* 
	 * This method is called when CRC is initialized and when browser window is resized
	 */
	this.onResize = function( type, args, me ) {}
	
	// fires when window is resized
	this.resizeComopnentHeight = function()
	{
		i2b2.PLUGINMGR.view.list.ResizeHeight();	// resize Plugin List
	}
	
	/* resize all components when splitter is dragged */
	this.dragged = function()
	{	
		var splitter = $( name );
		this.leftProportion = parseInt(splitter.style.left)/(YAHOO.util.Dom.getViewportWidth()-15); // remember the new leftProportion	
	}

	/*
 	*  Initializing instance variables and calling super's constructor 
 	*/	
 	this.name 		= name;
 	this.topOffset 	= 33;
	this.cont 		= config.cont;
	this.leftProportion = null;
	Splitter.superclass.constructor.apply(this, arguments);
}
// extension must immediately follow constructor (this makes the Splitter Drag-and-Drop-able.)
YAHOO.extend(Splitter, YAHOO.util.DD, 
{	
	cont: null,
	init: function()
	{
		// Call parent's init method
		Splitter.superclass.init.apply(this, arguments);
		var splitter = $( this.name );		
		if (YAHOO.env.ua.ie > 0)	// ie does not supoprt ew-resize (see http://msdn.microsoft.com/en-us/library/ie/aa358795%28v=vs.85%29.aspx)
			splitter.style.cursor = "e-resize";
		else
			splitter.style.cursor = "ew-resize";
		
		YAHOO.util.Event.on( window, 'resize', function()
		{ 
			this.initConstraints();
			this.onResize();
			this.resizeComopnentHeight();
		},
		this,
		true );
	},
	
	initConstraints: function()
	{		
		var dom = YAHOO.util.Dom;
		var region = dom.getRegion( this.cont );		
		var el = this.getEl();
		var xy = dom.getXY(el);
		var width 	= parseInt( dom.getStyle(el, 'width'), 10 );
		var left 	= xy[0] - region.left;
		var right 	= region.right - xy[0] - width;
		
		this.setXConstraint( left, right);
		this.setYConstraint( 0, 0 );		// no vertical travel
	}, 
	
	onDrag: function(e)
	{
		this.dragged();
	}
});



/*
 *  Property adjustment/setting utilities
 */
var stripUnit = function(numberAndUnitString, unitString)
{ return numberAndUnitString.substring(0, numberAndUnitString.indexOf(unitString)); }

var appendUnit = function(number, unit)
{ return number+unit; }

var setProperty = function( oldPropertyValue, newPropertyValue, oldUnit, newUnit )
{ return appendUnit(stripUnit(oldPropertyValue, oldUnit), newUnit); }

// propertyDiff is a Number, other parameters are Strings
var addToProperty = function( oldPropertyValue, propertyDiff, oldUnit, newUnit )
{ return appendUnit( parseInt(stripUnit(oldPropertyValue, oldUnit)) + propertyDiff, newUnit); }


/*
 * Debugging utilities
 */
var debugOnScreen = function( text )
{
	$('main.debug').appendChild( document.createTextNode( text ) );
	$('main.debug').appendChild( document.createElement("br") );
}

var debugOnScreenWithDate = function( text )
{
	var date = new Date();
	debugOnScreen( text + " " + date );
}

var debugOnScreenClear = function()
{
	$('main.debug').innerHTML = "";
}

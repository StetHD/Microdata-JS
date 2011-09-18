﻿// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @warning_level VERBOSE
// @jscomp_warning missingProperties
// @output_file_name default.js
// @check_types
// ==/ClosureCompiler==
/*
 * @author: Egor
 * @date: 10.08.2011
 *
 *  Implementation of the HTMl5 Microdata specification.
 *
 * Compilation of this sources:
 * 1. https://github.com/carlmw/Microdata-JS
 * 2. https://github.com/Treesaver/treesaver/blob/2180bb01e3cdb87811d1bd26bc81af020c1392bd/src/lib/microdata.js
 * 3. http://www.w3.org/TR/html5/microdata.html
 *
 * @version 1.3
 *  changeLog: 1.3 [11.08.11] [bug*] Fix bug with getAttribute
 * 			   1.2 [11.08.11] replace all hasAttribute to getAttribute for IE7
 *   
 */


if(!document.getItems)(
/**
 * @param {!Function} $$ querySelectorAll with toArray (must return Array)
 * @param {!Function} _toArray Function must return an Array representation of the enumeration.
 */
function($$, _toArray) {
	var MicrodataJS = global["MicrodataJS"] = {},
		/**
		 * Returns the itemValue of an Element.
		 * http://www.w3.org/TR/html5/microdata.html#values
		 * or http://dev.w3.org/html5/md/#dom-itemvalue
		 *
		 * @param {Element} element The element to extract the itemValue for.
		 * @return {string|Node} The itemValue of the element.
		 */
		getItemValue = MicrodataJS["getItemValue"] = function(element) {
			var elementName = element.nodeName;

			if(element.getAttribute("itemscope") !== null)//hasAttribute("itemscope")
				return element;
			else if(elementName === 'META')
				return element.content;
			else if(~['AUDIO', 'EMBED', 'IFRAME', 'IMG', 'SOURCE', 'VIDEO'].indexOf(elementName))
				return element.src;
			else if(~['A', 'AREA', 'LINK'].indexOf(elementName))
				return element.href;
			else if(elementName === 'OBJECT')
				return element.data;
			else if (elementName === 'TIME' && element.getAttribute('datetime'))
				return element.dateTime;//TODO:: Check IE[7,6]
			else
				return 'textContent' in element ? element.textContent :
					element.innerText;//IE-only fallback
		},
		fixItemElement = MicrodataJS["fixItemElement"] = function(_element) {
			var val;
			_element['itemScope'] = true;

			// Attach the (none-live) properties attribute to the element
			_element['properties'] = getProperties(_element);

			if(val = _element.getAttribute("itemid"))//hasAttribute
				_element['itemId'] = val;
				
			if(val = _element.getAttribute("itemref"))//hasAttribute
				_element['itemRef'] = val;

			if(val = _element.getAttribute("itemtype"))//hasAttribute
				_element['itemType'] = val;
			
			return _element;
		};

	/**
	 * Compares the document position of two elements.
	 * MIT Licensed, John Resig: http://ejohn.org/blog/comparing-document-position/
	 *
	 * @param {!Element} a Element to compare with b.
	 * @param {!Element} b Element to compare against a.
	 */
	function compareDocumentPosition(a, b) {
		return a.compareDocumentPosition ?
			a.compareDocumentPosition(b) :
			a.contains ?
				(a != b && a.contains(b) && 16) +
				(a != b && b.contains(a) && 8) +
				(a.sourceIndex >= 0 && b.sourceIndex >= 0 ?
					(a.sourceIndex < b.sourceIndex && 4) +
					(a.sourceIndex > b.sourceIndex && 2) :
				1) +
			0 : 0;
	};

	/**
	 * Returns the properties for the given item.
	 *
	 * @param {!Element} _root The item for which to find the properties.
	 * @return {!Array} The properties for the item.
	 */
	function getProperties(item) {
		var root = item,
			pending = [],
			props = [],
			properties = {
				"length" : 0
			},
			references = [],
			children,
			current;

		_toArray(root.childNodes).forEach(function(el) {
			if(el.nodeType === 1)pending.push(el)
		});

		if(root.getAttribute("itemref")) {
			references = root.getAttribute("itemref").trim().split(/\s+/);

			references.forEach(function(reference) {
				var element = document.getElementById(reference);

				if(element)pending.push(element);
			});
		}

		pending = pending.filter(function(candidate, index) {
			var scope = null,
				parent = candidate,
				ancestors = [];

			// Remove duplicates
			if (pending.indexOf(candidate) !== index &&
				pending.indexOf(candidate, index) !== -1)
				return false;

			while((parent = parent.parentNode) !== null && parent.nodeType === 1) {
				ancestors.push(parent);
				if(!!parent.getAttribute("itemscope") || parent.getAttribute("itemscope") === "") {
					scope = parent;
					break;
				}
			}

			if (scope !== null) {
				// If one of the other elements in pending is an ancestor element of
				// candidate, and that element is scope, then remove candidate from
				// pending.
				if (pending.indexOf(scope) !== -1)return false;

				// If one of the other elements in pending is an ancestor element of
				// candidate, and either scope is null or that element also has scope
				// as its nearest ancestor element with an itemscope attribute
				// specified, then remove candidate from pending.
				return !ancestors.some(function(ancestor) {
					var elementIndex = -1,
						elementParent,
						elementScope = null;

					// If ancestor is in pending
					if ((elementIndex = pending.indexOf(ancestor)) !== -1) {
						elementParent = pending[elementIndex];

						// Find the nearest ancestor element with an itemscope attribute
						while((elementParent = elementParent.parentNode) !== null &&
							   elementParent.nodeType === 1) {
							if (!!elementParent.getAttribute("itemscope") || elementParent.getAttribute("itemscope") === "") {
								elementScope = elementParent;
								break;
							}
						}
						// The nearest ancestor element equals scope
						if (elementScope === scope)return true;
					}
					return false;
				});
			}

			return true;
		});

		pending.sort(function(a, b) {
			return 3 - (compareDocumentPosition(b, a) & 6);
		});

		while((current = pending.pop())) {
			if(current.getAttribute("itemprop")) {
				props.push(current);

				// This is a necessary deviation from the normal algorithm because
				// we can not modify the Element prototype in IE7, so we recursively
				// calculate the properties for each property that has an itemscope.
				if(!!current.getAttribute("itemscope") || current.getAttribute("itemscope") === "") {
					current['itemScope'] = true;
					current['properties'] = getProperties(current);
				}
			}

			if (!current.getAttribute("itemscope") && current.getAttribute("itemscope") !== "") {
				// Push all the child elements of current onto pending, in tree order
				// (so the first child of current will be the next element to be
				// popped from pending).
				children = _toArray(current.childNodes).reverse();
				children.forEach(function(child) {
					if (child.nodeType === 1)pending.push(child);
				});
			}
		}

		//It's also possible to get a list of all the property names using the object's names IDL attribute.
		//http://www.w3.org/TR/html5/microdata.html#using-the-microdata-dom-api
		properties["names"] = [];

		properties["namedItem"] = function(p_name){return this[p_name]}//TODO:: Check for compliance with FINALE Microdata specification.

		props.forEach(function(property) {
			var p_names = property.getAttribute("itemprop").split(" "),
				_name,
				prop_value = getItemValue(property);

			property["itemValue"] = property.getAttribute("itemscope") ? property : prop_value;
			//The itemprop attribute, if specified, must have a value that is an unordered set of unique space-separated tokens representing the names of the name-value pairs that it adds. The attribute's value must have at least one token.
			property["itemProp"] = p_names;

			for(var i = 0, l = p_names.length ; i < l ; ++i) {
				_name = p_names[i];
				if(!~properties["names"].indexOf(_name)) {
					properties["names"].push(_name);
					properties["length"]++;
				}
				//"values" property
				//http://www.w3.org/TR/html5/microdata.html#using-the-microdata-dom-api
				((properties[_name] || (properties[_name] = []))["values"] || (properties[_name]["values"] = [])).push(prop_value);
				properties[_name].push(property);
			}
		});

		return properties;
	}


	function fixItemElement(_element) {
		_element['itemScope'] = true;

		// Attach the (none-live) properties attribute to the element
		_element['properties'] = getProperties(_element);

		if(_element.getAttribute("itemid"))
			_element['itemId'] = _element.getAttribute("itemid");

		if(_element.getAttribute("itemref"))
			_element['itemRef'] = _element.getAttribute("itemRef");

		if(_element.getAttribute("itemtype"))
			_element['itemType'] = _element.getAttribute("itemtype");

		return _element;
	}

	/**
	 * Gets all of the elements that have an itemType
	 * param itemTypes - whitespace-separated string of types to match
	 */
	document.getItems = function (itemTypes) {
		var items = $$("[itemscope]"),
			matches = [];

		if(itemTypes)itemTypes = itemTypes.trim().split(/\s+/);

		for (var i = 0, l = items.length ; i < l ; ++i) {
			var node = items[i],
				type = node.getAttribute('itemType');

			if((!itemTypes || ~itemTypes.indexOf(type)) &&
				!node.getAttribute("itemprop") && //Item can't contain itemprop attribute
				(!("itemScope" in node) || node["itemScope"])) {//writing to the itemScope property must affect whether the element is returned by getItems
				matches.push(fixItemElement(node));

				//node.toJSON = microdata_toJSON;//TODO
			}
		}

		return matches;
	}
})(
	function(selector) {return Array.prototype.slice.apply(document.querySelectorAll(selector))},//Youre own CSS3-selector function, return Array
	function(iterable) {return Array.prototype.slice.apply(iterable)}//Youre own toArray function
)

else (function(){
	//Check implementation of "values" property in PropertyNodeList in browser that support Microdata
	//Тут http://www.w3.org/TR/html5/microdata.html#using-the-microdata-dom-api (search: values)
	//TODO:: Check for compliance with FINALE Microdata specification.
	function micFrm_check() {
		if(window["PropertyNodeList"] && !("values" in window["PropertyNodeList"].prototype))
			window["PropertyNodeList"].prototype.__defineGetter__("values", function() { return this.getValues(); });
	}

	window["PropertyNodeList"] ?
		micFrm_check() :
		window.addEventListener("DOMContentLoaded", micFrm_check, false),
			window.addEventListener("load", micFrm_check, false);
})()
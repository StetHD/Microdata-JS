;(function(){
var e=void 0,i=null;"use strict";
var l=window,m,o,p={AUDIO:e,EMBED:e,IFRAME:e,IMG:e,SOURCE:e,TRACK:e,VIDEO:e},q={A:e,AREA:e,LINK:e},r={get:function(){var b=this.nodeName;return this.getAttribute("itemscope")!==i?this:this.getAttribute("itemprop")===i?i:"META"===b?this.content:b in p?this.src:b in q?this.href:"OBJECT"===b?this.data:"TIME"===b&&this.getAttribute("datetime")?this.dateTime:"textContent"in this?this.textContent:this.innerText},set:function(b){var c=this.nodeName;if(this.getAttribute("itemprop")===i)throw b=Object.create(DOMException.prototype),
b.code=DOMException.INVALID_ACCESS_ERR,b.message="INVALID_ACCESS_ERR: DOM Exception "+b.code,b;return this["META"===c?"content":c in p?"src":c in q?"href":"OBJECT"===c?"data":"TIME"===c&&this.getAttribute("datetime")?"dateTime":"innerHTML"]=b}};function s(b,c){b._||(b._={});var f=b.getAttribute(c),a=b._._mcrdt_||(b._._mcrdt_={}),d=a[c];if(d){if(f!==i&&d+""!==f)try{d.add("")}catch(g){}}else d=a[c]=new m(function(){return b.getAttribute(c)},function(){b.setAttribute(c,this+"")},b);return d}
var t={get:function(){return s(this,"itemtype")},set:function(b){return this.setAttribute("itemtype",b+""),b}};function u(b){return this.querySelectorAll(b?b.trim().split(/\s+/).map(function(b){return"[itemscope][itemtype~='"+b+"']"}).join(","):"")}var v=(HTMLDocument||{}).prototype||{},w="getItems"in document;m=l.DOMStringCollection;o=function(){};
(!w?function(b){function c(){this.length=0;this.names=[]}function f(){this.length=0;this.values=[]}f.prototype._push=function(a,b){this[this.length++]=a;this.values.push(b)};f.prototype.getValues=function(){for(var a=[],b=-1,c;c=this[++b];)a.push(c.itemValue);return a};f.prototype.toString=function(){return"[object PropertyNodeList]"};c.prototype.a=function(){for(var a in this)if(this[a]instanceof f||!isNaN(a))this[a]=i,delete this[a];this.length=0;this.names=[]};c.prototype._push=function(a){var b=
a.itemValue,c=a.itemProp,k,h=-1;if(c)for(this[this.length++]=a;k=c[++h];)~this.names.indexOf(k)||this.names.push(k),(this[k]||(this[k]=new f))._push(a,b)};c.prototype.namedItem=function(a){return this[a]instanceof f?this[a]:new f};c.prototype.toString=function(){return"[object HTMLPropertiesCollection]"};c.prototype.item=f.prototype.item=function(a){isNaN(a)&&(a=0);return this[a]||i};Object.defineProperties(b.Element.prototype,{itemValue:r,itemProp:{get:function(){return s(this,"itemprop")},set:function(a){return this.setAttribute("itemprop",
a+""),a}},itemScope:{get:function(){return this.getAttribute("itemscope")!==i},set:function(a){a?this.setAttribute("itemscope",""):this.removeAttribute("itemscope");return a}},itemId:{get:function(){var a=(this.getAttribute("itemid")||"").trim();a&&!/\w+:(\/\/)?[\w][\w.\/]*/.test(a)&&(a=location.href.replace(/\/[^\/]*$/,"/"+escape(a)));return a},set:function(a){return this.setAttribute("itemid",a+""),a}},itemType:t,itemRef:{get:function(){return s(this,"itemref")},set:function(a){return this.setAttribute("itemref",
a+""),a}},properties:{get:function(){this._||(this._={});var a=this._._mcrdt_||(this._._mcrdt_={}),d=a.b;if(d)if(b.microdata_liveProperties)d.a();else return d;else d=a.b=new c;for(var g=[],a=[],f=[],h,n=-1,j;j=this.childNodes[++n];)1===j.nodeType&&g.push(j);this.getAttribute("itemref")&&(f=this.getAttribute("itemref").trim().split(/\s+/),f.forEach(function(a){(a=document.getElementById(a))&&g.push(a)}));g=g.filter(function(a,b){var c=i,d=a,h=[];if(g.indexOf(a)!==b&&g.indexOf(a,b)!==-1)return false;
if(a.id&&f.indexOf(a.id)!==-1)return true;for(;(d=d.parentNode)!==i&&d.nodeType===1;){h.push(d);if(d.getAttribute("itemscope")!==i){c=d;break}}return c!==i?g.indexOf(c)!==-1?false:!h.some(function(a){var b=-1,d=i;if((b=g.indexOf(a))!==-1){for(a=g[b];(a=a.parentNode)!==i&&a.nodeType===1;)if(a.getAttribute("itemscope")!==i){d=a;break}if(d===c)return true}return false}):true});for(g.sort(function(a,b){return 3-(b.compareDocumentPosition(a)&6)});h=g.pop();)if(h.getAttribute("itemprop")&&a.push(h),h.getAttribute("itemscope")===
i)for(n=h.childNodes.length;j=h.childNodes[--n];)1===j.nodeType&&g.push(j);a.forEach(d._push.bind(d));return d}}});v.getItems=document.getItems=u;b.PropertyNodeList||(b.PropertyNodeList=f);b.HTMLPropertiesCollection||(b.HTMLPropertiesCollection=c);o()}:o)(l);
})();

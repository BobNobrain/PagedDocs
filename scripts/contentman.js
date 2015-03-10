// recursive data.xml parser
var processItem=function(base, itm)
{
	var label=itm.getAttribute("label");
	var type=itm.getAttribute("type");
	
	switch(type)
	{
	case "composite":
		type=Tree.NODE_COMPOSITE;
		break;
	case "group":
		type=Tree.NODE_GROUP;
		break;
	case "final":
		type=Tree.NODE_FINAL;
		break;
	}
	
	var data=null, nbase="";
	
	if(type!=Tree.NODE_FINAL)
	{
		nbase=itm.getAttribute("base");
		if(nbase==null || nbase==undefined) nbase="";
	}
	
	if(type!=Tree.NODE_GROUP)
	{
		data=base+nbase+itm.getAttribute("data");
	}
	
	var node=Tree.createNode(label, type, data);
	
	if(type!=Tree.NODE_FINAL)
	{
		var child=itm.firstElementChild;
		while(child!=null)
		{
			if(child.tagName=="item")
			{
				node.appendChild(processItem(base+nbase, child));
			}
			child=child.nextElementSibling;
		}
	}
	
	return node;
}

// for xml docs parsing

var XMLParsingToolkit=
{
	createTitle:function(text)
	{
		var title=document.createElement("h2");
		title.innerHTML=text;
		return title;
	},
	
	processXMLNode: function(xmlNode)
	{
		if(xmlNode.nodeType==3)
		{
			return document.createTextNode(xmlNode.nodeValue);
		}
		switch(xmlNode.tagName)
		{
		case "title":
			return XMLParsingToolkit.createTitle(xmlNode.innerHTML);
			
		case "listing":
			var lang=xmlNode.getAttribute("lang");
			if(lang==null || lang==undefined || lang=="") lang=Prefs.defaultLang;
			return XMLParsingToolkit.createListing(xmlNode.innerHTML, lang);
			
		case "ref":
			return XMLParsingToolkit.createRef(xmlNode.innerHTML, Prefs.dataRootUrl+xmlNode.getAttribute("to"));
			
		case "entry":
			return XMLParsingToolkit.processEntry(xmlNode);
			
		case "description":
			var wrapper=document.createElement("div");
			var entry=xmlNode.firstElementChild;
			while(entry!=null)
			{
				// description should contain only entry tags, so >>dev/null everything else
				if(entry.tagName=="entry")
				{
					wrapper.appendChild(XMLParsingToolkit.processEntry(entry));
				}
				entry=entry.nextElementSibling;
			}
			return wrapper;
			
		case "seealso":
			return XMLParsingToolkit.processSeeAlsoSection(xmlNode);
			
		default:
			var tag=document.createElement(xmlNode.tagName);
			tag.innerHTML=xmlNode.innerHTML;
			return tag;
		}
	},
	
	createEntry:function()
	{
		var div=document.createElement("div");
		div.classList.add("entry");
		return div;
	},
	
	processEntry: function(xmlEntry)
	{
		if(xmlEntry==null) return null;
		
		var htmlEntry=XMLParsingToolkit.createEntry();
		
		var sibling=xmlEntry.firstChild;
		while(sibling!=null)
		{
			htmlEntry.appendChild(XMLParsingToolkit.processXMLNode(sibling));
			
			sibling=sibling.nextSibling;
		}
		
		return htmlEntry;
	},
	
	createListing: function(text, lang)
	{
		var listing=document.createElement("div");
		listing.classList.add("listing");
		listing.innerHTML=SyntaxAnalyzer.processCode(text, lang);
		return listing;
	},
	
	createRef: function(text, to)
	{
		var ref=document.createElement("span");
		ref.classList.add("ref");
		ref.innerHTML=text;
		ref.setAttribute("data-to", to);
		ref.onclick=function()
		{
			Navigation.navigate(this.getAttribute("data-to"));
			Interface.navigator.activate(Navigation.getTreeElement(this.getAttribute("data-to")));
		}
		return ref;
	},
	
	createSeeAlsoBlock: function()
	{
		var sab=document.createElement("div");
		sab.classList.add("see-also");
		return sab;
	},
	
	processSeeAlsoSection: function(xmlSAElement)
	{
		var sab=XMLParsingToolkit.createSeeAlsoBlock();
		var ul=document.createElement("ul");
		sab.appendChild(ul);
		var child=xmlSAElement.firstElementChild;
		while(child!=null)
		{
			var li=document.createElement("li");
			li.appendChild(XMLParsingToolkit.processXMLNode(child));
			ul.appendChild(li);
			child=child.nextElementSibling;
		}
		return sab;
	}

}

ContentManager=
{
	init: function()
	{
		xml=new window.XMLHttpRequest();
		xml.open("GET", "data.xml", false);
		xml.setRequestHeader('Content-Type', 'text/xml')
		xml.send(null);
		
		if(xml.status==200)
		{
			var nav=xml.responseXML.firstChild;
			
			var roots=[];
			
			var child=nav.firstElementChild;
			while(child!=null)
			{
				if(child.tagName=="item")
				{
					roots.push(processItem(Prefs.dataRootUrl, child));
				}
				child=child.nextElementSibling;
			}
			
			Navigation.init(Interface.navigator.getWrapper(), roots);
			//var navTree=NavTree.create(Interface.navigator.getWrapper(), roots);
		}
	},
	
	load: function(filename)
	{
		xml=new window.XMLHttpRequest();
		xml.open("GET", filename, true);
		xml.setRequestHeader('Content-Type', 'text/xml')
		xml.send(null);
		
		xml.onreadystatechange=function()
		{
			if(xml.readyState==4)
			{
				if(xml.status==200)
				{
					Interface.content.show(ContentManager.parseXML(xml.responseXML.firstElementChild));
				}
			}
		}
	},
	
	parseXML: function(xmlRoot)
	{
		var wrapper=document.createElement("div");
		
		var sibling=xmlRoot.firstElementChild;
		while(sibling!=null)
		{
			/*var name=sibling.tagName;
			switch(name)
			{
			case "title":
				wrapper.appendChild(createTitle(sibling.innerHTML));
				break;
			case "description":
				// processing each entry tag inside description tag
				// TODO
				
				break;
			case "seealso":
				wrapper.appendChild(processSeeAlsoSection(sibling));
				break;
			}*/
			
			wrapper.appendChild(XMLParsingToolkit.processXMLNode(sibling))
			
			sibling=sibling.nextElementSibling;
		}
		
		return wrapper;
	}
}

subscribeOnLoad(ContentManager.init);

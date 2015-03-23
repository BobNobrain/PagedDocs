/* Ribbon is a wide toolbar panel containing different SECTIONS.
 * Sections could be either named or not and contain any amount of inner
 * ELEMENTS, including 0 (such empty sections should be marked with "empty"
 * class. Sections are visually separated one from another. They can have
 * either defined static width or dynamic (set .width = -1)
 * Elements inside sections are full-height "subsections", visually not 
 * separated one from another except little margins. Elements are control
 * elements and could be of these types:
 * - NAME						FULL-HEIGHT	INFO
 * - button 					both
 * - list 						yes			can be of checkable items
 * - textbox					no
 * - labeled checkbox			no			checkbox surrounded with <label>
 * - [radio buttons group]		yes			"list" of radio buttons
 * - group						yes			wrapper for non-full-height
 * 											elements with vertical flow
 * - listitem					no			inner element for list
 * - space						yes			invisible separator
 * The last element is used to group non-full-height elements into one
 * vertical column that would appear to fill the whole height of ribbon.
 * 
 */

var getSectionDummy=function()
{
	return {
		wrapper: null,
		name: "",
		isEmpty: true,
		elements: [],
		width: -1,
		
		addElement: function(elem)
		{
			isEmpty=false;
			this.elements.push(elem);
			this.wrapper.appendChild(elem.wrapper);
		},
		
		recreateLayout: function()
		{
			if(this.wrapper==null) this.wrapper=document.createElement("div");
			this.wrapper.innerHTML="";
			this.wrapper.className="";
			
			if(this.name!="") this.wrapper.setAttribute("data-name", this.name);
			else this.wrapper.removeAttribute("data-name");
			
			if(this.width<0) this.wrapper.style.width="";
			else this.wrapper.style.width=this.width+"px";
			
			this.wrapper.classList.add("section");
			
			if(this.isEmpty)
			{
				this.wrapper.classList.add("empty");
			}
			else
			{
				for(var i=0; i<this.elements.length; i++)
				{
					this.elements[i].recreateLayout();
					this.wrapper.appendChild(this.elements[i].wrapper);
				}
			}
		}
	};
}

var getElementDummy=function()
{
	return {
		wrapper: null,
		type: 0,
		name: "New element",
		enabled: true
	};
}


Ribbon=
{
	// Element types
	ELEMENT_SPACE: 0,
	ELEMENT_BUTTON: 1, ELEMENT_TEXTBOX: 2, ELEMENT_CHECKBOX: 3, ELEMENT_LIST: 4,
	ELEMENT_LIST_ITEM: 5, ELEMENT_GROUP: 6, ELEMENT_RADIO_GROUP: /*(unused)*/ 7,
	
	/* Ribbon.create(wrapper) creates and returns new ribbon object. It will
	 * place ribbon html elements into wrapper. Ribbon object has:
	 * -{} wrapper: HTMLElement - wraps ribbon contents
	 * -[] sections - contains section objects
	 * -() createSection(name, width) - creates and adds into sections[] a
	 *     new section object. Also injects html elements into ribbon wrapper
	 *     automatically. Returns newly created section object.
	 * -() recreateLayout() - erases everything in wrapper and creates
	 *     every section layout again, adding it into wrapper.
	 */
	create: function(wrapper)
	{
		var rbn = { wrapper: wrapper, sections: [] };
		rbn.createSection=function(name, width)
		{
			var nsection=Ribbon.createSection(name, width);
			this.sections.push(nsection);
			this.wrapper.appendChild(nsection.wrapper);
			return nsection;
		}
		
		rbn.recreateLayout=function()
		{
			this.wrapper.innerHTML="";
			for(var i=0; i<this.sections.length; i++)
			{
				this.sections[i].recreateLayout();
				this.wrapper.appendChild(this.sections[i].wrapper);
			}
		}
		
		rbn.recreateLayout();
		
		return rbn;
	},
	
	createSection: function(name, width)
	{
		if(width==null || width==undefined) width=-1;
		
		var dummy=getSectionDummy();
		dummy.name=name;
		dummy.width=width;
		dummy.recreateLayout();
		return dummy;
	},
	
	createButton: function(label, iconChar, enabled)
	{
		if(typeof enabled != typeof false) enabled=true;
		
		var btn=getElementDummy();
		btn.name=label;
		btn.type=Ribbon.ELEMENT_BUTTON;
		btn.enabled=enabled;

		btn.recreateLayout=function()
		{
			if(this.wrapper==null) this.wrapper=document.createElement("div");
			else this.wrapper.innerHTML="";
			
			this.wrapper.className="";
			
			this.wrapper.classList.add("button");
			if(!this.enabled) this.wrapper.classList.add("disabled");
			
			if(iconChar==null || iconChar==undefined) iconChar="";
			this.wrapper.setAttribute("data-icon", iconChar);
			
			lbl=document.createElement("div");
			lbl.classList.add("label");
			lbl.innerHTML=this.name;
			this.wrapper.appendChild(lbl);
			this.labelElement=lbl;
		}
		btn.recreateLayout();
		
		btn.setName=function(newName)
		{
			this.name=newName;
			this.labelElement.innerHTML=this.name;
		}
		
		btn.disable=function()
		{
			if(!this.enabled) return;
			this.enabled=false;
			this.wrapper.classList.add("disabled");
		}
		
		btn.enable=function()
		{
			if(this.enabled) return;
			this.enabled=true;
			this.wrapper.classList.remove("disabled");
		}
		
		return btn;
	},
	
	createList: function(name, labels, checkable, width)
	{
		if(typeof checkable != typeof false) checkable=false;
		if(typeof width != typeof 0) width=-1;
		var list=getElementDummy();
		list.name=name;
		list.type=Ribbon.ELEMENT_LIST;
		list.elements=[];
		list.checkable=checkable;
		list.defaultElement={ enabled: false, content: Prefs.text.ribbonListDefaultElementContent }
		list.width=width;
		
		for(var i=0; i<labels.length; i++)
		{
			li=Ribbon.createListItem(labels[i], true, false);
			list.elements.push(li);
		}
		
		list.recreateLayout=function()
		{
			if(this.wrapper==null) this.wrapper=document.createElement("ul");
			else this.wrapper.innerHTML="";
			this.wrapper.className="";
			this.wrapper.classList.add("list");
			
			if(this.checkable) this.wrapper.classList.add("checkable");
			
			if(this.width>0) this.wrapper.style.width=this.width+"px";
			else this.wrapper.style.width="";
			
			if(this.elements.length==0)
			{
				if(this.defaultElement.enabled)
				{
					this.elements.push(Ribbon.createListItem(this.defaultElement.content, false, false, false));
				}
			}
			
			for(var i=0; i<this.elements.length; i++)
			{
				this.elements[i].recreateLayout();
				this.wrapper.appendChild(this.elements[i].wrapper);
			}
		}
		
		list.clear=function()
		{
			this.elements=[];
			this.wrapper.innerHTML="";
		}
		
		list.getCheckedLabels=function()
		{
			var result=[];
			for(var i=0; i<this.elements.length; i++)
			{
				if(this.elements[i].checked) result.push(this.elements[i].name);
			}
			return result;
		}
		
		list.setAllChecked=function(flag)
		{
			for(var i=0; i<this.elements.length; i++)
			{
				this.elements.setChecked(flag);
			}
		}
		
		list.recreateLayout();
		
		return list;
	},
	
	createListItem: function(label, enabled, checked)
	{
		var li=getElementDummy();
		li.type=Ribbon.ELEMENT_LIST_ITEM;
		li.enabled=enabled;
		li.checked=checked;
		li.name=label;
		
		li.recreateLayout=function()
		{
			if(this.wrapper==null) this.wrapper=document.createElement("li");
			else this.wrapper.innerHTML=null;
			this.wrapper.className="";
			if(!this.enabled) this.wrapper.classList.add("disabled");
			if(this.checked) this.wrapper.classList.add("checked");
			
			this.wrapper.innerHTML=this.name;
			this.wrapper.element=this;
			this.wrapper.onclick=function()
			{
				if(!this.element.enabled) return;
				this.element.setChecked(!this.element.checked);
			}
		}
		
		li.setChecked=function(flag)
		{
			if(flag)
			{
				this.checked=true;
				this.wrapper.classList.add("checked");
			}
			else
			{
				this.checked=false;
				this.wrapper.classList.remove("checked");
			}
		}
		li.recreateLayout();
		return li;
	},
	
	createTextBox: function(name, enabled, width, placeholder)
	{
		if(typeof width != typeof 0) width=-1;
		if(typeof placeholder != typeof "") placeholder="";
		
		var tb=getElementDummy();
		tb.name=name;
		tb.enabled=enabled;
		tb.width=width;
		tb.placeholder=placeholder;
		
		tb.recreateLayout=function()
		{
			if(this.wrapper==null)
			{
				this.wrapper=document.createElement("input");
				this.wrapper.setAttribute("type", "text");
				//this.wrapper.element=this;
			}
			else
			{
				this.wrapper.innerHTML="";
				this.wrapper.value="";
				this.wrapper.className="";
			}
			this.wrapper.setAttribute("name", this.name);
			this.wrapper.setAttribute("placeholder", this.placeholder);
			
			if(!this.enabled) this.wrapper.classList.add("disabled");
			if(this.width>0) this.wrapper.style.width=this.width+"px";
			else this.wrapper.style.width="";
		}
		
		tb.getText=function()
		{
			return this.wrapper.value;
		}
		
		tb.recreateLayout();
		
		return tb;
	},
	
	createCheckBox: function(label, enabled, checked)
	{
		if(typeof checked != typeof false) checked=false;
		
		var cb=getElementDummy();
		cb.name=label;
		cb.enabled=enabled;
		cb.defaultChecked=checked;
		
		cb.recreateLayout=function()
		{
			if(this.wrapper==null)
			{
				this.wrapper=document.createElement("label");
				//this.wrapper.element=this;
			}
			else
			{
				this.wrapper.innerHTML="";
				this.wrapper.className="";
			}
			
			var box=document.createElement("input");
			box.setAttribute("type", "checkbox");
			box.setAttribute("name", this.name);
			box.checked=this.defaultChecked;
			this.wrapper.appendChild(box);
			
			this.wrapper.appendChild(document.createTextNode(this.name));
			
			if(!this.enabled) this.wrapper.classList.add("disabled");
			if(this.width>0) this.wrapper.style.width=this.width+"px";
			else this.wrapper.style.width="";
		}
		
		cb.isChecked=function()
		{
			return this.wrapper.checked;
		}
		
		cb.recreateLayout();
		
		return cb;
	},
	
	createSpaceBlock: function(width)
	{
		if(typeof width != typeof 0) width=-1;
		
		var space=getElementDummy();
		space.width=width;
		
		space.recreateLayout=function()
		{
			if(this.wrapper==null)
			{
				this.wrapper=document.createElement("div");
			}
			this.wrapper.className="";
			this.wrapper.classList.add("space");
			if(this.width>0) this.wrapper.style.width=this.width+"px";
			else this.wrapper.style.width="";
		}
		
		space.recreateLayout();
		
		return space;
	},
	
	createGroup: function(width)
	{
		if(typeof width != typeof 0) width=-1;
		
		var group=getElementDummy();
		group.width=width;
		group.elements=[];
		
		group.addElement=function(elem)
		{
			this.elements.push(elem);
			this.wrapper.appendChild(elem.wrapper);
		}
		
		group.recreateLayout=function()
		{
			if(this.wrapper==null)
			{
				this.wrapper=document.createElement("div");
			}
			this.wrapper.className="";
			this.wrapper.classList.add("group");
			if(this.width>0) this.wrapper.style.width=this.width+"px";
			else this.wrapper.style.width="";
			
			for(var i=0; i<this.elements.legth; i++)
			{
				this.elements[i].recreateLayout();
				this.wrapper.appendChild(this.elements[i].wrapper);
			}
		}
		
		group.recreateLayout();
		
		return group;
	}
}
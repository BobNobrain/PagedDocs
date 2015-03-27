var navigateTo=function(ref)
{
	p=ref.split("::");
	Interface.content.show(Prefs.text.loading);
	ContentManager.load(p[0]);
	if(p.length>1)
	{
		console.log(p[1]);
	}
}

Navigation=
{
	navTree: null,
	ribbon: null,
	cpos: -1,
	
	init: function(wrapper, roots)
	{
		Navigation.navTree=NavTree.create(wrapper, roots);
	},
	
	history:[],
	pushToHistory: function(ref)
	{
		Navigation.history.push({ ref:ref, date:new Date() });
	},
	
	navigate: function(ref)
	{
		navigateTo(ref);
		if(Navigation.cpos!=Navigation.history.length-1)
		{
			// We've travelled (far) back and need to erase history
			// that is after us
			Navigation.history.splice(Navigation.cpos+1, Navigation.history.length-Navigation.cpos-1);
		}
		Navigation.pushToHistory(ref);
		Navigation.cpos++;
		
		Interface.ribbon.refreshNavButtons();
	},
	
	canGoBack: function()
	{ return Navigation.cpos>0; },
	goBack: function()
	{
		if(!Navigation.canGoBack()) return;
		Navigation.cpos--;
		navigateTo(Navigation.history[Navigation.cpos].ref);
		
		Interface.ribbon.refreshNavButtons();
	},
	
	canGoForward: function()
	{ return Navigation.cpos<Navigation.history.length-1; },
	goForward: function()
	{
		if(!Navigation.canGoForward()) return;
		Navigation.cpos++;
		navigateTo(Navigation.history[Navigation.cpos].ref);
		
		Interface.ribbon.refreshNavButtons();
	},
	
	navigateHome: function()
	{
		Navigation.navigate(Prefs.navigation.homePageUrl);
	},
	
	navigateToTop: function()
	{
		console.log("To top");
	},
	
	
	getTreeElement: function(data)
	{
		if(Navigation.navTree==null) return null;
		
		var liArr=Navigation.navTree.wrapper.getElementsByTagName("li");
		for(var i=0; i<liArr.length; i++)
		{
			if(liArr[i].treeNode!=null && liArr[i].treeNode!=undefined)
			{
				if(liArr[i].treeNode.data==data)
					return liArr[i];
			}
		}
		return null;
	},
	
	createRibbon: function(wrapper)
	{
		Navigation.ribbon=Ribbon.create(wrapper);
		
		// Section for scroll-to-top button
		var section=Navigation.ribbon.createSection("", -1);
		section.addElement(Ribbon.createButton(Prefs.navigation.text.scrollToTop, {
			iconChar: Prefs.navigation.text.scrollToTopIcon, enabled:true, onclick:function()
			{
				console.log("Наверх");
				Navigation.navigateToTop();
			}
		}));
		
		// History navigation section
		section=Navigation.ribbon.createSection(Prefs.navigation.text.historyNavSection, -1);
		
		Interface.ribbon.goBackButton=Ribbon.createButton(Prefs.navigation.text.goBack, {
			iconChar: Prefs.navigation.text.goBackIcon, enabled:true, onclick:function()
			{
				Navigation.goBack();
				console.log("Назад");
			}
		});
		section.addElement(Interface.ribbon.goBackButton);
		
		Interface.ribbon.goForwardButton=Ribbon.createButton(Prefs.navigation.text.goForward, {
			iconChar: Prefs.navigation.text.goForwardIcon, enabled:true, onclick:function()
			{
				Navigation.goForward();
				console.log("Вперёд");
			}
		});
		section.addElement(Interface.ribbon.goForwardButton);
		
		section.addElement(Ribbon.createSpaceBlock(-1));
		
		section.addElement(Ribbon.createButton(Prefs.navigation.text.homePage, {
			iconChar: Prefs.navigation.text.homePageIcon, enabled:true, onclick:function()
			{
				Navigation.navigateHome();
				console.log("Домой");
			}
		}));
		
		section.addElement(Ribbon.createSpaceBlock(-1));
		
		section.addElement(Ribbon.createButton(Prefs.navigation.text.browseHistory, {
			iconChar: Prefs.navigation.text.browseHistoryIcon, enabled:false, onclick:function()
			{
				console.log("История");
			}
		}));
		
		// Search section
		section=Navigation.ribbon.createSection(Prefs.navigation.text.searchNavSection, -1);
		
		var group=Ribbon.createGroup(-1);
		group.addElement(Ribbon.createTextBox("Search", true, 200, Prefs.navigation.text.searchInvitation));
		group.addElement(Ribbon.createCheckBox(Prefs.navigation.text.caseSensitive, true, Prefs.navigation.caseSensitiveSearch));
		group.addElement(Ribbon.createCheckBox(Prefs.navigation.text.onlyInTitles, false, Prefs.navigation.searchOnlyInTitles));
		group.addElement(Ribbon.createButton(Prefs.navigation.text.search, {
			enabled:true, onclick:function()
			{
				console.log("Поиск!");
			}
		}));
		section.addElement(group);
		
		section.addElement(Ribbon.createList(Prefs.navigation.text.searchResults, ["1", "2"], false, 200));
		
		
		
		/*
		section.addElement(Ribbon.createButton("My button", { iconChar:"^", enabled:true, onclick:function(){alert("bla")} }));
		section.addElement(Ribbon.createSpaceBlock(-1));
		section.addElement(Ribbon.createList("My list", ["Elem 1","Elem 2","Elem 3","Elem 5","Elem 7", "Elem 11"], true, 200));
		
		section=Navigation.ribbon.createSection("Another section", 500);
		
		var group=Ribbon.createGroup(-1);
		group.addElement(Ribbon.createTextBox("searcher", true, 200, "Placeholder test"));
		group.addElement(Ribbon.createCheckBox("My checkbox", true, true));
		group.addElement(Ribbon.createButton("Apply", "", true));
		
		section.addElement(group);
		
		section.addElement(Ribbon.createSpaceBlock(5));
		section.addElement(Ribbon.createButton("Big button motherfucker!", { iconChar:"!", enabled:true }));
		*/
	}
}

subscribeOnLoad(function(){Navigation.createRibbon(Interface.ribbon.getTabWrapper(1));});
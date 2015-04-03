var navigateTo=function(ref)
{
	p=ref.split("::");
	Interface.content.show(Prefs.text.loading);
	ContentManager.load(p[0], function(response)
	{
		document.decoder.source=response;
		Interface.content.show(document.decoder.parse());
	}, "wiki");
	
	if(p.length>1)
	{
		// for in-page references
		// (mb will be implemented in future)
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
		console.log(ref);
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
		document.getElementById("content-header").scrollIntoView();
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
				Navigation.navigateToTop();
			}
		}));
		
		// History navigation section
		section=Navigation.ribbon.createSection(Prefs.navigation.text.historyNavSection, -1);
		
		Interface.ribbon.goBackButton=Ribbon.createButton(Prefs.navigation.text.goBack, {
			iconChar: Prefs.navigation.text.goBackIcon, enabled:true, onclick:function()
			{
				Navigation.goBack();
			}
		});
		section.addElement(Interface.ribbon.goBackButton);
		
		Interface.ribbon.goForwardButton=Ribbon.createButton(Prefs.navigation.text.goForward, {
			iconChar: Prefs.navigation.text.goForwardIcon, enabled:true, onclick:function()
			{
				Navigation.goForward();
			}
		});
		section.addElement(Interface.ribbon.goForwardButton);
		
		section.addElement(Ribbon.createSpaceBlock(-1));
		
		section.addElement(Ribbon.createButton(Prefs.navigation.text.homePage, {
			iconChar: Prefs.navigation.text.homePageIcon, enabled:true, onclick:function()
			{
				Navigation.navigateHome();
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
			enabled:false, onclick:function()
			{
				console.log("Поиск!");
			}
		}));
		section.addElement(group);
		
		section.addElement(Ribbon.createList(Prefs.navigation.text.searchResults, [], {
			checkable:false, 
			width: 200,
			defaultElementEnabled: true
		}));
	}
}

subscribeOnLoad(function(){Navigation.createRibbon(Interface.ribbon.getTabWrapper(1));});
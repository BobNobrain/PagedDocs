Navigation=
{
	navTree: null,
	init: function(wrapper, roots)
	{
		Navigation.navTree=NavTree.create(wrapper, roots);
	},
	
	navigate: function(ref)
	{
		Interface.content.show(Prefs.text.loading);
		ContentManager.load(ref);
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
	}
}
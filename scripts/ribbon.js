
Ribbon=
{
	// Section types
	SECTION_EMPTY: 0, SECTION_FILLED: 1, SECTION_SEPARATOR: 2, SECTION_VERTICAL_FLOW: 3,
	
	create: function(wrapper)
	{
		var rbn = { wrapper: wrapper, sections: [] };
		rbn.createSection=function(name, type)
		{
			this.sections.push(Ribbon.createSection(name, type));
		}
	},
	
	createSection: function(name, type, params)
	{
		
	},
	
	createButton: function(label)
	{
		
	},
	
	createList: function(labels, checkable)
	{
		
	},
	
	createListItem: function(label, enabled, checked)
	{
		
	}
}
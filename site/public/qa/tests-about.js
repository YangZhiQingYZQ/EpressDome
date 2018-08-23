suite('"About" Page Tests',()=>{
	test('page showld contain link to contact page',()=>{
		assert($('a[href="/contact"]').length);
	});	
});

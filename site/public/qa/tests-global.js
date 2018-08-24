//套用main.handlebars模版的页面测试代码
suite("Global Tests",()=>{
	test("page has a valid title",()=>{
		assert(document.title && document.title.match(/\S/) && document.title.toUpperCase()!=="TODO");	
	});
});

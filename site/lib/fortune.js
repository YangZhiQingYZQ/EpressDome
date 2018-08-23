//---动态渲染信息数组（虚拟幸运饼干）
let fortuneCookies = [
	"Conquer your fears or they will conquer you.",
	"Rivers need springs.",
	"Do not fear what you don't know.",
	"You will have a pleasant surprise.",
	"Whenever possible,keep it simple"
];

exports.getFortune = ()=>{
	let idx = math.floor(Math.random()*fortunes.length);
	return fortuneCookies[idx]''
}

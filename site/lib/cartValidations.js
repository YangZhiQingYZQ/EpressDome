// v10.0.0
module.exports = {
	checkWaivers(req,res,next){
		let cart = req.session.cart;
		if(!cart) return next();
		if(cart.some(i=>{return i.product.requiresWaiver;})){
			if(!cart.warnings) cart.warnings = [];
			cart.warning.push("One or more of your selected" + "tours requires a waiver.");
		}
		next();
	},
	checkGuestCounts(req,res,next){
		let cart = req.session.cart;
		if(!cart) return next();
		if(cart.some(item=>{ return item.guests > item.product.maximumGuestes;})){
			if(!cart.errors) cart.errors = [];
			cart.errors.push("One or more of your selected tours" + "cannot accoommodate the number of guests you" + "hvae selected.");
		}
		next();
	}
}
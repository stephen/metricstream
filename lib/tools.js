
Array.prototype.average = function() {
	var avg = 0;
	this.forEach(function(val) {
		avg += val;
	});
	return avg / this.length;
};
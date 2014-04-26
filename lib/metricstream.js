var util = require('util');
var stream = require('stream');
var Transform = stream.Transform;

function MetricStream(options) {

	this.options = options || {};
	Transform.call(this, options);
	this.byteCount = 0;
	this.messageCount = 0;

	if (this.options.record) {
		this.start = new Date().getTime();
		this.recording = [];
	}

	setInterval(this._updateMetrics.bind(this), 1000);
}

util.inherits(MetricStream, Transform);

MetricStream.prototype._updateMetrics = function() {
	this.emit('stats', {
		bytesPerSecond : this.byteCount,
		messagesPerSecond : this.messageCount
	});

	this.byteCount = 0;
	this.messageCount = 0;
};

MetricStream.prototype._transform = function(chunk, encoding, callback) {
	this.push(chunk, encoding);

	//	amazing metrics
	this.messageCount++;
	this.byteCount += chunk.length;

	if (this.options.record) {
		this.recording.push({ t: new Date().getTime() - this.start, data: chunk });
	}

	callback();
};

MetricStream.prototype._flush = function(callback) {
	clearInterval(this._updateMetrics);
	callback();
};

MetricStream.prototype.getRecording = function() {
	var output = {
		start: this.start,
		data: this.recording
	};

	return output;
};

module.exports = MetricStream;
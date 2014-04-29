var util = require('util');
var stream = require('stream');
var Transform = stream.Transform;
require('./tools');

function MetricStream(options) {

	this.options = options || {};
	Transform.call(this, options);

	this.sampleDuration = this.options.sampleDuration || 4;
	this.byteCountHistory = [];
	this.messageCountHistory = [];
	this.byteCount = 0;
	this.messageCount = 0;
	this._neverUpdated = true;

	if (this.options.record) {
		this.start = new Date().getTime();
		this.recording = [];
	}

	this._interval = setInterval(this._updateMetrics.bind(this), 1000);
}

util.inherits(MetricStream, Transform);

MetricStream.prototype._updateMetrics = function() {
	this._neverUpdated = false;

	if (this.byteCountHistory.length >= this.sampleDuration) {
		this.byteCountHistory.shift();
	}
	this.byteCountHistory.push(this.byteCount);

	if (this.messageCountHistory.length >= this.sampleDuration) {
		this.messageCountHistory.shift();
	}
	this.messageCountHistory.push(this.messageCount);

	this.emit('stats', {
		bytesPerSecond : this.byteCountHistory.average(),
		messagesPerSecond : this.messageCountHistory.average()
	});

	this.byteCount = 0;
	this.messageCount = 0;
};

MetricStream.prototype._transform = function(chunk, encoding, callback) {
	this.push(chunk, encoding);

	this.messageCount++;
	this.byteCount += chunk.length;

	if (this.options.record) {

		this.recording.push({ 
			t: new Date().getTime() - this.start, 
			data: chunk
		});
	}

	callback();
};

MetricStream.prototype._flush = function(callback) {
	if (this._neverUpdated)
		this._updateMetrics();
	clearInterval(this._interval);
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
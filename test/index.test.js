var MetricStream = require('../lib/metricstream');
var assert = require('assert');

describe('metricstream', function () {

  it('should work as expected', function(done) {
  	var stream = new MetricStream();

  	stream.on('stats', function(d) {
  		assert(d.bytesPerSecond === 3);
  		done();
  	});

  	stream.write('sup');
  	stream.end();
  });

  it ('should record data', function() {
  	var MetricStream = require('../lib/metricstream');

	var stream = new MetricStream({ record: true });
	stream.write('sup');
	stream.write('1');
	stream.write('2');
	stream.write('3');

	var recording = stream.getRecording();
	assert(recording.data[0].data.toString() === 'sup');
	assert(recording.data[1].data.toString() === '1');
	assert(recording.data[2].data.toString() === '2');
	assert(recording.data[3].data.toString() === '3');

	stream.end();

  });

})

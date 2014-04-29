var MetricStream = require('../lib/metricstream');
var assert = require('assert');
require('../lib/tools');

describe('metricstream', function () {

  it('should emit stats data events', function(done) {
  	var stream = new MetricStream();

  	stream.on('stats', function(d) {
  		assert(d.bytesPerSecond <= 3);
  		done();
  	});

  	stream.write('sup');
  	stream.end();
  });

  it ('should record data', function() {

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
});

describe('metricstream timing', function() {
  this.timeout(0);

  it('should average over time correctly', function(done) {
  this.timeout(0);

    var sampleDuration = 2;
    var stream = new MetricStream({ record: true, sampleDuration: sampleDuration });

    var lastStats = null;
    stream.on('stats', function(d) {
      lastStats = d;
    });

    // writes
    var _interval = setInterval(function() {
      stream.write('sup');
      stream.write('1');
      stream.write('2');
      stream.write('3');
    }, 100);

    setTimeout(function() {

      // end
      clearInterval(_interval);
      stream.end();

      // compute avg manually with recording
      var recording = stream.getRecording();
      var avgBytes = 0, avgMessages = 0;

      recording.data.forEach(function(val) {
        if (val.t >= 3100) {
          avgBytes += val.data.length;
          avgMessages += 1;
        }
      });

      avgBytes /= sampleDuration;
      avgMessages /= sampleDuration;

      // done
      assert(avgBytes === lastStats.bytesPerSecond);
      assert(avgMessages === lastStats.messagesPerSecond);
      done();

    }, 5100);

  });
})

describe('Array extensions', function() {
  it('should produce an average', function() {
    var x = [ 0, 50, 100 ];
    assert(x.average() === 50);
  });
})

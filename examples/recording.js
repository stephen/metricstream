var MetricStream = require('../lib/metricstream');

var stream = new MetricStream({ record: true });
stream.write('sup');
stream.write('hi');
stream.on('stats', function(d) {
	console.log('bps:', d.bytesPerSecond, 'mpg:', d.messagesPerSecond);
});
process.stdin.pipe(stream);

setTimeout(function() {
	console.log(stream.getRecording());
}, 5000);

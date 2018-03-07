var tape = require('tape');

var stream = tape.createStream({ objectMode: true });
var failures = 0;

stream.on('data', row => {
  switch (row.type) {
    case 'test':
      console.group(row.name);
      break;

    case 'end':
      console.groupEnd();
      break;

    case 'assert':
      if (!row.ok) failures += 1;

      var mark = row.ok ? "✔" : "✗";
      console.log(mark + " " + row.name);
      if (!row.ok && row.operator == 'equal') {
        console.group("Details");
        console.log("Actual:", row.actual);
        console.log("Expected:", row.expected);
        console.groupEnd();
      }
      break;
    
    default:
      console.log("Unknown...", row);
  }
});

stream.on('end', () => {
  console.log(failures+ " failures");
});

require('./request');
require('./response');
require('./application');
import $ from 'jquery';
import tone from 'tone';


var $test = $('#test');
$test.css('color', 'red');
var playBtn = $('#play');
var synth = new tone.Synth().toMaster();

playBtn.click(() => {
  synth.triggerAttackRelease('B#4', '4n');
});

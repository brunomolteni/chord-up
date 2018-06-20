import { h, Component } from 'preact';
import './Keyboard.css';

const OCTAVES = 5;
const STARTING_OCTAVE = 1;

const octave = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

let createNotes = (howMany, startingOctave) => {
  var result = [];
  for (var i = 0; i < howMany; i++) {

    result = result.concat( octave.map( note => `${note}${i+startingOctave}` ) )
  }
  return result;
};

const notes = createNotes(OCTAVES,STARTING_OCTAVE);

let getNote = key => {
  let index = key - 24 - (STARTING_OCTAVE*12);
  if(index >= 0){
    return notes[index];
  }
  else return false;

};

export default class ClassName extends Component {
  state= {
    notes
  }

  componentWillMount(){
    EE.addListener('note',this.playNote);
  }

  componentWillUnmount(){
    EE.removeAllListeners('note');
  }

  shouldComponentUpdate() {
    // do not re-render via diff:
    return false;
  }

  playNote = data => {

    let note = getNote(data.key);
    log(note);

    if(note){
      let el = document.getElementById(`track-${data.track}-${note}`);
      if(el && data.noteOn){
        el.classList.remove('--released');
        el.classList.remove('--playing');
        void el.offsetWidth;
        el.classList.add('--playing');
      }
      if(el && !data.noteOn) {
        // re-trigger CSS animation
        el.classList.remove('--released');
        el.classList.remove('--playing');
        void el.offsetWidth;
        el.classList.add('--released');
      }
    }
  }

  render({color, track, base},{notes}){
    let parsedColor = color && `rgba(${color.r},${color.g},${color.b},${color.a})`;
    return (
      <div class="Keyboard" id={'track-'+(base?'base':track)} style={{color: parsedColor}}>
        {notes.map(note =>(
          <span id={'track-'+(base?'base':track)+'-'+note} class={`Keyboard__key ${note.indexOf('#')>-1 ? '--sharp' : ''}`}>{base && note}</span>
        ))}
      </div>
    )
  }
}

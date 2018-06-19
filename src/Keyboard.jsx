import { h, Component } from 'preact';
import './Keyboard.css';


let octave = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

let createNotes = (howMany, startingOctave=3) => {
  let result = [];
  for (var i = 0; i < howMany; i++) {

    result = result.concat( octave.map( note => `${note}${i+startingOctave}` ) )
  }
  return result;
};

export default class ClassName extends Component {
  state= {
    notes: createNotes(4)
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

  playNote = note => {
    let el = document.getElementById(note);
    if(el) {
      // re-trigger CSS animation
      el.classList.remove('--playing');
      void el.offsetWidth;
      el.classList.add('--playing');
    }
  }

  render(props,{notes}){
    return (
      <div class="Keyboard">
        {notes.map(note =>(
          <span id={note} class={`Keyboard__key ${note.indexOf('#')>-1 ? '--sharp' : ''}`}>{note}</span>
        ))}
      </div>
    )
  }
}

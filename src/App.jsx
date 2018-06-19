import { h, Component } from 'preact';
import WebMidi from 'webmidi';
import {EventEmitter} from 'fbemitter';
import './App.css';

import Header from './Header';
import Keyboard from './Keyboard';

export default class App extends Component {
  state= {
    inputs: WebMidi.inputs,
  }

  setInput = event => {
    let input = this.state.inputs[event.target.value];
    this.setState({selected: input})
    // Remove all listeners for 'noteon' on all channels
    input.removeListener('noteon');
    // Listen for a 'note on' message on all channels
    input.addListener('noteon', "all", e => {
        log("Received 'noteon' message (" + e.note.name + e.note.octave + ").");
        EE.emit('note',e.note.name+e.note.octave);
      }
    );
  }

  render(props,state) {
    return (
      <main>
        <Header setInput={this.setInput} {...state}/>
        <Keyboard/>
      </main>
    );
  }
}

import { h, Component } from 'preact';
import WebMidi from 'webmidi';
import './App.css';

import Header from './Header';
import Keyboard from './Keyboard';

export default class App extends Component {
  render(props,state) {
    return (
      <main>
        <Keyboard/>
      </main>
    );
  }
}

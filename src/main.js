import { h, render } from 'preact';
import WebMidi from 'webmidi';
import {EventEmitter} from 'fbemitter';

import App from './App';

const DEBUG = true;

const setup = () => {
  window.EE = new EventEmitter();
  window.log = DEBUG ? console.log : ()=>false;
}

const mountNode = document.getElementById('app');
const runApp = () => render(<App />, mountNode, mountNode.lastChild);

WebMidi.enable(err => {
  if (err) {
    log("WebMidi could not be enabled.", err);
  } else {
    // Everything OK, setup and run the app
    setup();
    runApp();
  }
});

if (module.hot) {
  module.hot.dispose(function () {
    // El módulo está a punto de ser reemplazado
  });

  module.hot.accept(function () {
    runApp();
  });
}

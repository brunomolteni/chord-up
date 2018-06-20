import { h, render } from 'preact';
import WebMidi from 'webmidi';
import {EventEmitter} from 'fbemitter';

import Primus from './primus.js';
import App from './App';

const DEBUG = false;

const setup = () => {
  window.EE = new EventEmitter();
  window.log = DEBUG ? console.info : ()=>false;
  window.primus = Primus.connect(document.location.url);

  primus.on('data', function message(d) {
    let splitted = d.split('}{');

    let emitNote = d => {
      var data = JSON.parse(d);
      EE.emit('note',data);
    }

    if( splitted.length === 1 ){
      emitNote(d)
    }else if(splitted.length > 1 ){
      splitted
      .map( (el,i) => {
        if(i !== 0) el = '{'+el;
        if(i !== splitted.length-1 ) el+='}';
        return el;
      })
      .forEach((d,i) => {
        emitNote(d)
      })
    }
  });
}

const mountNode = document.getElementById('app');
const runApp = () => render(<App />, mountNode, mountNode.lastChild);


setup();
runApp();

if (module.hot) {
  module.hot.dispose(function () {
    // El módulo está a punto de ser reemplazado
  });

  module.hot.accept(function () {
    runApp();
  });
}

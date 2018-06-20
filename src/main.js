import { h, render } from 'preact';
import {EventEmitter} from 'fbemitter';

import Primus from './primus.js';
import App from './App';

const DEBUG = true;

const setup = () => {
  window.EE = new EventEmitter();
  window.log = DEBUG ? console.info : ()=>false;
  window.primus = Primus.connect("0.0.0.0:8888");

  primus.on('data', function message(d) {
    let splitted = d.split('}{');

    let setupEmitter = d => {
      var data = JSON.parse(d);
      log('Got Data:',data);
      if(data.key)EE.emit('note',data);
      if(data.channels)EE.emit('channels',data.channels);
    }

    if( splitted.length === 1 ){
      setupEmitter(d)
    }else if(splitted.length > 1 ){
      splitted
      .map( (el,i) => {
        if(i !== 0) el = '{'+el;
        if(i !== splitted.length-1 ) el+='}';
        return el;
      })
      .forEach((d,i) => {
        setupEmitter(d)
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

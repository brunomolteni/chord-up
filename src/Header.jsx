import { h, Component } from 'preact';
import './Header.css';

const Header = ({setInput, inputs, selected}) => (
  <header class="Header">
    <h1>Chord-Up</h1>
    <div class="Header__inputs">
      <label>Input:</label>
      <select onChange={setInput}>{ inputs.map( (el,i)=> <option value={i} key={i}>{el.name}</option>) }</select>
    </div>
  </header>
);

export default Header;

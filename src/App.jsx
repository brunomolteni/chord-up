import { h, Component } from 'preact';
import './App.css';

import Keyboard from './Keyboard';

export default class App extends Component {
  state = {
    channels: []
  }

  componentWillMount(){
    EE.addListener('channels',this.setChannels);
    EE.addListener('color',this.setColor);
  }

  setChannels = channels => {
    log('channels',channels);
    this.setState({channels});
  }
  setColor = data => {
    log('color',data);
    let channels = this.state.channels;
    channels[data.track] = data;
    this.setState({channels});
    log(this.state);
  }

  reload = ()=>{
    electron.reload();
  }

  render(props,{channels}) {
    return (
      <main>
        <Keyboard base/>
        {!!channels.length ?
           channels.map( (channel,i) => <Keyboard color={channel.color} track={channel.track}/>)
           :
           <h2>Open Bitwig and <a onClick={this.reload} style=" -webkit-app-region: no-drag; cursor: pointer">click here</a> to reload</h2>
         }
      </main>);
  }
}

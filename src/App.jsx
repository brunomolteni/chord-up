import { h, Component } from 'preact';
import './App.css';

import Keyboard from './Keyboard';

export default class App extends Component {
  state = {
    channels: []
  }

  componentWillMount(){
    EE.addListener('channels',this.setChannels);
  }

  setChannels = channels => {
    log('channels',channels);
    this.setState({channels});
  }

  render(props,{channels}) {
    return channels.length && (
      <main>
        <Keyboard base/>
        {channels.length && channels.map( (channel,i) => <Keyboard color={channel.color} track={channel.track}/>)}
      </main>
    );
  }
}

import React, {Component} from 'react';
import '../styles/App.css';
import {Header} from './Header';
import {Main} from './Main';

class App extends Component {
    state = {
        isLoggedIn: false
    }

    render() {
        return (
            <div className="App">
                <Header isLoggedIn={this.state.isLoggedIn}/>
                <Main usLoggedIn={this.state.isLoggedIn}/>
            </div>
        );
    }
}

export default App;

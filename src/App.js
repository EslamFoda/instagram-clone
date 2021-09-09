import { Route,BrowserRouter as Router,Switch } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Singup from './Signup'
import Timeline from './Timeline';
import Explore from './Explore';
import Profile from './Profile';
import Post from './Post'
function App() {

  

  return (
    <Router>
    <div className="App">
      <Switch>
        <Route exact path='/'>
     <Login />
        </Route>
        <Route path='/signup'>
          <Singup />
        </Route>
        <Route path='/timeline'>
          <Timeline />
        </Route>
        <Route path='/explore'>
          <Explore />
        </Route>
        <Route path='/profile/:name'>
          <Profile />
        </Route>
        <Route path='/post/:id'>
          <Post />
        </Route>
      </Switch>
    </div>
    </Router>
  );
}

export default App;
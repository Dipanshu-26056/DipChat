import { Switch, Route } from "react-router-dom";
import './App.css';
import Homepage from "./Pages/Homepage";
import ChatPage from "./Pages/ChatPage";

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path='/' component={Homepage} exact/>
        <Route path='/chats' component={ChatPage}/>
      </Switch>
    </div>
  );
}

export default App;

import RubiksCube from './RubiksCube'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <RubiksCube />
      <div className="instructions">
        <h2>3x3 魔方</h2>
        <p>
          <strong>操作说明：</strong>
        </p>
        <ul>
          <li>鼠标落在魔方上并拖动：转动相应层</li>
          <li>鼠标落在空白处并拖动：转动整个魔方</li>
        </ul>
      </div>
    </div>
  )
}

export default App

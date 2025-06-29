import React from 'react'

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🚀 Storytelling App</h1>
      <p>✅ System is running!</p>
      <p>✅ Backend connected</p>
      <p>✅ Grok AI integrated</p>
      
      <div style={{ marginTop: '20px' }}>
        <h3>API Status:</h3>
        <a href="/health" target="_blank">Health Check</a>
      </div>
    </div>
  )
}

export default App
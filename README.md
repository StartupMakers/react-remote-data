react-remote-data
===
Simple data container with declarative state control. Just like Relay.

## Installation

```bash
npm install react-remote-data --save
```

## Usage

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import RemoteData from 'react-remote-data'

ReactDOM.render(
  <RemoteData 
    route="https://api.github.com/users/facebook/repos"
    renderLoading={() => (
      <div className="data--loading">
        Loading...
      </div>
    )}
    />,
  document.getElementById('app')
);
```

## Advanced usage

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import RemoteData from 'react-remote-data'
import Spinner from 'react-spinkit'

function ReposList({ userID })
  <RemoteData 
    route={() => `https://api.github.com/users/${userID}/repos`}
    renderLoading={() => (
      <Spinner spinnerName='circle'/>
    )}
    renderFetched={({ data }) => {
      <ul>
        {data.map(item => (
          <li>{item['name']}</li>
        )}
      </ul>
    }}
    renderFailure={(error, retry) => (
      <span className="error">
        Failed to fetch data: {error.message}.
        <button onClick={retry}>
          Retry
        </button>
      </span>
    )}
    alt="Meow meow cat"
    />,
  document.getElementById('app')
)    
```

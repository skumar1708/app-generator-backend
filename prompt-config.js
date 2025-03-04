export const FRONT_END_PROMPT = `You are an expert full-stack developer. Given a project {{VIEW_PROMPT}}, generate a structured and modular codebase.

Return the response strictly as a JSON object, where:
- Keys are file paths, like "src/components/Header.js" or "routes/userRoutes.js".
- Values are JavaScript/React/Node code snippets.  **Critically, the code snippets MUST be valid JSON strings.  This means all newline characters (\\n), tabs (\\t), double quotes (\\"), and backslashes (\\\\) within the code MUST be properly escaped.  Use JSON.stringify() internally to ensure the code strings are valid JSON.**  Do not include any additional formatting like backticks or code block markers.

**Frontend (React.js)**
- Create a structured React app.
- Place reusable UI components inside a "src/components/" folder.
- Store page-level components inside a "src/pages/" folder.
- API calls should be stored in "src/services/api.js".
- Implement "App.js" as the main entry point.
- Use "index.js" to render the app.
- Also create a public folder that has a index.html with a div having id as root
- Add interactivity by enhancing react components in more details to make application more realistic
- Also use proper styling and placements of header, footer and all elements with nice and vibrant colors and icons.
- Write all css styling in App.css only, no need to create other component specific css files
- Write code in new line in each file, proper formatted and without linting errors, in human readable form. Do not keep code in one line. Use Prettier or a similar tool *before* converting the code to a JSON string to ensure proper formatting within the code itself.

**Dependencies & Configuration**
- Include a "package.json" file with the necessary dependencies to run the React app.
- Ensure the "package.json" file contains a "start" script with "react-scripts --openssl-legacy-provider start" and "react-scripts --openssl-legacy-provider build" to run the application.
- **Critically, do not use Switch from react-router-dom

**Example (Illustrative - Showing Escaping -  This is how your response should be formatted):**

{
  "src/components/Header.js": "import React from 'react';\\n\\nfunction Header() {\\n  return (\\n    <h1>Header</h1>\\n  );\\n}\\n\\nexport default Header;",
  "src/pages/Home.js": "import React from 'react';\\n\\nfunction Home() {\\n  return (\\n    <h1>Home Page</h1>\\n  );\\n}\\n\\nexport default Home;",
  "src/services/api.js": "export const fetchData = async () => {\\n  try {\\n    const response = await fetch('/api/data');\\n    const data = await response.json();\\n    return data;\\n  } catch (error) {\\n    console.error('Error fetching data:', error);\\n    throw error;\\n  }\\n};",
  "src/App.js": "import React from 'react';\\nimport Header from './components/Header';\\nimport Home from './pages/Home';\\nimport './App.css';\\n\\nfunction App() {\\n  return (\\n    <div className=\\"app-container\\">\\n      <Header />\\n      <Home />\\n    </div>\\n  );\\n}\\n\\nexport default App;",
  "src/App.css": ".header {background-color: #333;color: white;padding: 1rem;text-align: center;}.footer {background-color: #333;color: white;padding: 1rem;text-align: center;position: fixed;bottom: 0;width: 100%;}",
  "src/index.js": "import React from 'react';\\nimport ReactDOM from 'react-dom/client';\\nimport App from './App';\\n\\nconst root = ReactDOM.createRoot(document.getElementById('root'));\\nroot.render(\\n  <React.StrictMode>\\n    <App />\\n  </React.StrictMode>\\n);",
  "public/index.html": "<div id=\\"root\\"></div>",
  "package.json": "{\\n  \\"name\\": \\"my-react-app\\",\\n  \\"version\\": \\"0.1.0\\",\\n  \\"private\\": true,\\n  \\"dependencies\\": {\\n    \\"react\\": \\"^18.0.0\\",\\n    \\"react-dom\\": \\"^18.0.0\\",\\n    \\"react-scripts\\": \\"latest\\"\\n  },\\n  \\"scripts\\": {\\n    \\"start\\": \\"react-scripts --openssl-legacy-provider start\\",\\n    \\"build\\": \\"react-scripts --openssl-legacy-provider build\\",\\n    \\"test\\": \\"react-scripts test\\",\\n    \\"eject\\": \\"react-scripts eject\\"\\n  },\\n  \\"eslintConfig\\": {\\n    \\"extends\\": [\\"react-app\\", \\"react-app/jest\\"]\\n  },\\n  \\"browserslist\\": {\\n    \\"production\\": [\\n      \\">0.2%\\",\\n      \\"not dead\\",\\n      \\"not op_mini all\\"\\n    ],\\n    \\"development\\": [\\n      \\"last 1 chrome version\\",\\n      \\"last 1 firefox version\\",\\n      \\"last 1 safari version\\"\\n    ]\\n  }\\n}"
}
`;
export const BACK_END_PROMPT = `You are an expert full-stack developer. Given a project {{VIEW_PROMPT}}, generate a structured and modular codebase.

Return the response strictly as a JSON object, where:
- Keys are file paths, like "src/components/Header.js" or "routes/userRoutes.js".
- Values are JavaScript/React/Node code snippets, *without* any additional formatting like backticks or code block markers.  The code should be valid JavaScript/React/Node code directly within the JSON string.

**Backend (Node.js + Express)**
- Organize API endpoints inside a "routes/" folder.
- Place business logic inside a "controllers/" folder.
- Store data models inside a "models/" folder.
- The main server entry point should be "server.js".

**Dependencies & Configuration**
- Include a "package.json" file with the necessary dependencies to run the  app.
- Ensure the "package.json" file contains a "start" script to run the application.
- add MONGO_URI variable in .env MONGO_URI = "http://mongouri:<user>:<password>"

**Example (Illustrative - Your response should be valid JSON):**
{
  "src/components/Header.js": "import React from 'react'; export default function Header() { return <h1>Header</h1>; }",
  "src/pages/Home.js": "import React from 'react'; export default function Home() { return <h1>Home Page</h1>; }",
  "src/services/api.js": "export const fetchData = () => fetch('/api/data');",
  "App.js": "import React from 'react'; function App() { return <h1>My App</h1>; } export default App;",
  "main.js": "import React from 'react'; import ReactDOM from 'react-dom'; import App from './App'; ReactDOM.render(<App />, document.getElementById('root'));"
}`;
const config = {
  test: {
    API_URL: "http://localhost:3000",
    ENGINE_WS_URL: "ws://localhost:3001"
  },
  development: {
    API_URL: "http://localhost:3000",
    ENGINE_WS_URL: "ws://localhost:3001"
  },
  production: {
    // API_URL: "http://23.88.70.95:3000/api",
    API_URL: "https://mallet.gg/api",
    ENGINE_WS_URL: "wss://23.88.70.95:3001"
  }
}

export default config[process.env.NODE_ENV]
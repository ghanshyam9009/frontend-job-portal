import axios from 'axios';

const adminApiClient = axios.create({
  baseURL: 'https://i9xj8uhrgg.execute-api.ap-southeast-1.amazonaws.com',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default adminApiClient;

const fs = require('fs');
const path = require('path');
const axios = require('axios');


const getNewAccessToken = async (url,params,headers = {}) => {
    try {
        const response = await axios.post(url, null, {
            params: params,
            headers: headers
        });
        return response.data
    } catch (error) {
        console.error('Error refreshing access token:', error.response ? error.response.data : error.message);
    }  
}



const updateEnvVariable = (key, value) => {
  const envPath = path.resolve(__dirname, '../.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const newEnvContent = envContent.replace(new RegExp(`^${key}=.*`, 'm'), `${key}=${value}`);
  fs.writeFileSync(envPath, newEnvContent);
}

const handleTokenRefresh = async (url,params,headers={},tokenName) => {
  try {
    let newToken = '';
    const tokenData = await getNewAccessToken(url,params,headers);
    const { access_token = '', refresh_token = '' } = tokenData 
    
    if(tokenName === 'CALENDLY_API_TOKEN' && refresh_token!==''){
      updateEnvVariable('CALENDLY_REFRESH_TOKEN', refresh_token);
    }

    updateEnvVariable(tokenName,access_token)
    return access_token
  } catch (error) {
    console.error('Failed to update token:', error);
  }
}


module.exports = {
    handleTokenRefresh
}




export const msalConfig = {
    auth: {
        clientId: '6f3d4317-0f86-4344-ba21-842e03423485',
        authority: 'https://login.microsoftonline.com/f32f94fa-61a1-4605-a7d9-3e9048460448', // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
        redirectUri: 'https://anthempreviewnew.azurewebsites.net/',
    },
    cache: {
        cacheLocation: 'localStorage', // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
    scopes: ["User.Read"],
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
      graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
    };
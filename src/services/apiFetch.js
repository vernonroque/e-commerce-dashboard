const apiFetch = async (url, options = {}) => {
    
    let response = await fetch(url, {
        ...options,
        credentials: 'include'
    });

    if (response.status === 401) {
        // try refreshing
        console.log("I receieved a 401 response status in apiFetch");
        const refresh = await fetch('http://localhost:8080/api/auth/refresh', {
            method: 'POST',
            credentials: 'include'
        });

        if (refresh.ok) {
            // retry original request
            response = await fetch(url, {
                ...options,
                credentials: 'include'
            });
        } else {
            // refresh failed (403 = reuse attack, or other error)
            // TODO: handle logout / redirect to login
            console.error("Refresh failed with status:", refresh.status);
        }
    }

    return response;
};

export default apiFetch;
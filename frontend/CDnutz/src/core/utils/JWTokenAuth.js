

async function JWTokenFetch(url, options = {}) {
    const jwt = JSON.parse(localStorage.getItem("JWTauth"));

    const requestOptions = {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${jwt.access}`,
        },
    };

    let response = await fetch(url, requestOptions);

    if (response.status === 401) {
        const refreshed = await refreshAccess();

        if (!refreshed) {
            // Refresh token is invalid too
            localStorage.removeItem("JWTauth");

            return false;
        }

        const newJwt = JSON.parse(localStorage.getItem("JWTauth"));

        requestOptions.headers.Authorization = `Bearer ${newJwt.access}`;

        response = await fetch(url, requestOptions);
    }

    return response;
}


async function refreshAccess() {
    const jwt = JSON.parse(localStorage.getItem("JWTauth"));

    const response = await fetch(
        "http://localhost:8000/cdnutz/auth/refresh/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                refresh: jwt.refresh,
            }),
        }
    );

    if (!response.ok) {
        return false;
    }

    const payload = await response.json();

    localStorage.setItem(
        "JWTauth",
        JSON.stringify({
            access: payload.access,
            refresh: jwt.refresh, // keep the same refresh token
        })
    );

    return true;
}


export {JWTokenFetch, refreshAccess};
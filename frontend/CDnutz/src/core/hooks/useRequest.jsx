import { useState } from "react";


function useRequest() {
    const [data, setData] = useState("");

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);


    const request = async (url, options = {}) => {
        setLoading(true)
        setError(null)

        const config = {
            ...options,
            headers : {
                ...options.headers
            }
        }

        config.body = JSON.stringify(config.body)

        try {
            const response = await fetch(
                url,
                config
            )

            const payload = await response.json()

            if (!response.ok) {
                const err = new Error("Request failed")
                err.status = response.status
                err.data = payload

                throw err
            }

            setData(payload)

            return payload

        } catch (err) {
            setError(err)
            throw err

        } finally {
            setLoading(false)
        }
    }

    return {
        "request"    : request,
        "data"       : data,
        "dataSetter" : setData,
        "error"      : error,
        "errSetter"  : setError,
        "loading"    : loading,
    }

}


export default useRequest;
import { useState, useEffect } from 'react';
import axios, { type AxiosRequestConfig, AxiosError } from 'axios';

interface UseAxiosProps extends AxiosRequestConfig {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: any;
}

interface UseAxiosResult<T> {
    data: T | null;
    loading: boolean;
    error: AxiosError | null;
}

export function useAxios<T = any>({ url, method = 'GET', body = null, ...config }: UseAxiosProps): UseAxiosResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AxiosError | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.request<T>({
                    url,
                    method,
                    data: body,
                    signal: controller.signal,
                    ...config,
                });
                setData(response.data);
            } catch (err) {
                if (!axios.isCancel(err)) {
                    setError(err as AxiosError);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            controller.abort();
        };
    }, [url, method, body, config]);

    return { data, loading, error };
}

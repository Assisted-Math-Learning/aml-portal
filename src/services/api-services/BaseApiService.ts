import ENV_CONFIG from 'constant/env.config';
import Axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  CancelToken,
  CancelTokenSource,
  RawAxiosRequestHeaders,
} from 'axios';
import * as uuid from 'uuid';
import * as Sentry from '@sentry/react';
import { toastService } from 'services/ToastService';
import { removeCookie } from 'shared-resources/utils/helpers';
import { localStorageService } from '../LocalStorageService';

interface RequestConfig extends AxiosRequestConfig {
  requestId?: string;
  redirectIfUnauthorized?: boolean;
}

export declare type QueryParams = {
  [key: string]: string | string[];
};

const BASE_URL = ENV_CONFIG.BACKEND_URL as string;

export class BaseApiService {
  private static instance: BaseApiService;

  private axiosInstance: AxiosInstance;

  private requestMap = new Map<string, CancelTokenSource>();

  private constructor() {
    // Set up Axios instance with interceptor
    this.axiosInstance = Axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if ([401, 403].includes(error.response?.status)) {
          this.handleUnauthorizedError();
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): BaseApiService {
    if (!this.instance) {
      this.instance = new BaseApiService();
    }
    return this.instance;
  }

  private handleUnauthorizedError() {
    localStorageService.removeCSRFToken();
    removeCookie('connect.sid');
    toastService.showError(
      'Your session has expired. Please login again to continue.'
    );
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  }

  public get<T = any>(
    url: string,
    opts?: {
      params?: QueryParams;
      headers?: AxiosRequestHeaders;
      extras?: {
        requestId?: string;
        useAuth?: boolean;
      };
    }
  ): Promise<T> {
    return this.request<T>(
      {
        method: 'GET',
        url,
        headers: opts?.headers,
        params: opts?.params,
        requestId: opts?.extras?.requestId,
      },
      opts?.extras?.useAuth
    );
  }

  public delete<T = any>(
    url: string,
    opts?: {
      params?: QueryParams;
      headers?: AxiosRequestHeaders;
      extras?: {
        requestId?: string;
        useAuth?: boolean;
      };
    }
  ) {
    return this.request<T>(
      {
        method: 'DELETE',
        url,
        headers: opts?.headers,
        params: opts?.params,
        requestId: opts?.extras?.requestId,
      },
      opts?.extras?.useAuth
    );
  }

  public post<T = any>(
    url: string,
    id: string,
    data?: any,
    opts?: {
      headers?: AxiosRequestHeaders;
      params?: QueryParams;
      extras?: {
        requestId?: string;
        useAuth?: boolean;
      };
    }
  ) {
    const payload = {
      id,
      ver: '1.0',
      ts: new Date(),
      params: {
        msgid: uuid.v4(),
      },
      request: data,
    };
    return this.request<T>(
      {
        method: 'POST',
        url,
        data: payload,
        headers: { ...opts?.headers },
        params: opts?.params,
        requestId: opts?.extras?.requestId,
      },
      opts?.extras?.useAuth
    );
  }

  public put<T = any>(
    url: string,
    data?: any,
    opts?: {
      headers?: AxiosRequestHeaders;
      params?: QueryParams;
      extras?: {
        requestId?: string;
        useAuth?: boolean;
      };
    }
  ) {
    return this.request<T>(
      {
        method: 'PUT',
        url,
        data,
        headers: opts?.headers,
        params: opts?.params,
        requestId: opts?.extras?.requestId,
      },
      opts?.extras?.useAuth
    );
  }

  public patch<T = any>(
    url: string,
    data?: any,
    opts?: {
      headers?: AxiosRequestHeaders;
      params?: QueryParams;
      extras?: {
        requestId?: string;
        useAuth: boolean;
      };
    }
  ) {
    return this.request<T>(
      {
        method: 'PATCH',
        url,
        data,
        headers: opts?.headers,
        params: opts?.params,
        requestId: opts?.extras?.requestId,
      },
      opts?.extras?.useAuth
    );
  }

  generateHeaders = async (
    headers?: RawAxiosRequestHeaders,
    useAuth?: boolean
  ) => {
    let defaultHeaders = {};

    if (useAuth) {
      defaultHeaders = {
        ...defaultHeaders,
        Authorization: `bearer ${localStorageService.getAuthToken()}`,
      };
    }

    if (!headers) {
      return defaultHeaders;
    }
    return {
      ...defaultHeaders,
      ...headers,
      'CSRF-Token': `${localStorageService.getCSRFToken()}`,
    };
  };

  private async request<T>(
    config: RequestConfig,
    useAuth?: boolean
  ): Promise<T> {
    const cancelToken = this.addToRequestMap(config.requestId);
    try {
      const response = await this.axiosInstance.request({
        ...config,
        cancelToken,
        headers: await this.generateHeaders(config.headers, useAuth ?? true),
      });
      this.removeFromRequestMap(config.requestId);
      return response?.data as T;
    } catch (error: any) {
      this.removeFromRequestMap(config.requestId);
      // Sentry.setContext('API Request', {
      //   url: `${BASE_URL}${config.url}`,
      //   method: config.method,
      //   params: JSON.stringify(config.params),
      //   data: JSON.stringify(config.data),
      //   error: JSON.stringify(error?.response?.data),
      // });
      // eslint-disable-next line no-console
      console.log(
        'ERROR',
        {
          url: `${BASE_URL}${config.url}`,
          method: config.method,
          params: JSON.stringify(config.params),
          data: JSON.stringify(config.data),
        },
        `API Error: ${config.method} ${config.url}`,
        JSON.stringify(error?.response?.data)
      );
      // Sentry.captureException(
      //   new Error(`API Error: ${config.method} ${config.url}`)
      // );
      if (error.response && error.response.data) {
        // eslint-disable-next line no-console
        console.log(error.response.data);
      } else {
        // eslint-disable-next line no-console
        console.log(error);
      }
      throw error;
    }
  }

  private addToRequestMap(requestId?: string): CancelToken | undefined {
    if (!requestId) {
      return undefined;
    }

    const source = Axios.CancelToken.source();
    this.requestMap.set(requestId, source);
    return source.token;
  }

  private removeFromRequestMap(requestId?: string) {
    if (!requestId) {
      return;
    }

    this.requestMap.delete(requestId);
  }
}

export const baseApiService = BaseApiService.getInstance();

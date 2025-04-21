declare module 'node-fetch' {
  export default function fetch(url: string | Request, init?: RequestInit): Promise<Response>;
  export class Request extends globalThis.Request {}
  export class Response extends globalThis.Response {
    buffer(): Promise<Buffer>;
  }
  export class Headers extends globalThis.Headers {}
  export class FetchError extends Error {
    type: string;
    code?: string;
    errno?: string;
  }
} 
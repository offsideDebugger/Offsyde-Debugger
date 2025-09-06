import { create } from 'zustand';




interface ResponseData {
    data?: {
        title: string;
        routes: string[];
        allLinks?: string[];
        stats?: {
            totalLinks: number;
            sameOriginLinks: number;
        };
    };
    error?: string;
    success?: boolean;
}


// Defined the shapes of the state

interface UrlState {
  url: string;
  setUrl: (state: { url: string }) => void;
}

interface ResponseDataState{
    responseData: ResponseData | null;
    setResponseData: (data: ResponseData | null) => void;
}


const useUrlStore = create<UrlState>((set) => ({
  url: "",
  setUrl: (state) => set({ url: state.url }),
}));



const useResponseDataStore = create<ResponseDataState>((set) => ({
    responseData: null,
    setResponseData: (data) => set({ responseData: data }),
}));


export { useUrlStore } ;

export { useResponseDataStore } ;
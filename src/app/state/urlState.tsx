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


export interface PageSpeedData {
    data?: {
        url: string;
        title: string;
        loadTime?: string;
        metrics?: {
            domContentLoaded: string;
            pageLoadComplete: string;
            timeToFirstByte: string;
            domElements: number;
            images: number;
            scripts: number;
            stylesheets: number;
        };
        performance?: {
            grade: string;
            color: string;
        };
    };
    success?: boolean;
    error?: string;

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

interface TestDataState{
    testData: PageSpeedData | null;
    setTestData: (data: PageSpeedData | null) => void;
}



const useResponseDataStore = create<ResponseDataState>((set) => ({
    responseData: null,
    setResponseData: (data) => set({ responseData: data }),
}));


const useTestData = create<TestDataState>((set) => ({
    testData: null,
    setTestData: (data) => set({ testData: data }),
}));

export { useUrlStore };

export { useResponseDataStore };

export { useTestData };
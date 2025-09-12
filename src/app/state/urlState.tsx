
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

// Dominator API Response Interfaces
export interface DominatorData {
    title: string;
    brokenImageData: Array<{
        index: number;
        src: string;
        alt: string;
        issues: string[];
        naturalWidth: number;
        naturalHeight: number;
        renderedWidth: number;
        renderedHeight: number;
        complete: boolean;
        isBroken: boolean;
        isLinked: boolean;
    }>;
    brokenVideos: Array<{
        index: number;
        src: string;
        sources: string[];
        hasValidSource: boolean;
        outerHTML: string;
    }>;
    brokenAudios: Array<{
        index: number;
        src: string;
        sources: string[];
        hasValidSource: boolean;
        outerHTML: string;
    }>;
    brokenIframes: Array<{
        index: number;
        src: string;
        title: string;
        issues: string[];
        sandbox: string;
        loading: string;
        outerHTML: string;
    }>;
    videoCount: number;
    audioCount: number;
    iframeCount: number;
}

export interface DominatorLinksData {
    title: string;
    brokenStylesheets: Array<{
        index: number;
        href: string;
        media: string;
        issues: string[];
        crossorigin: string;
        integrity: string;
        disabled: boolean;
    }>;
    brokenScripts: Array<{
        index: number;
        src: string;
        type: string;
        issues: string[];
        async: boolean;
        defer: boolean;
        crossorigin: string;
    }>;
    stylesheetCount: number;
    scriptCount: number;
    summary: {
        totalIssues: number;
        stylesheetIssues: number;
        scriptIssues: number;
    };
}

export interface DominatorCSSData {
    title: string;
    totalIssues: number;
    issues: Array<{
        type: string;
        severity: 'high' | 'medium' | 'low';
        message: string;
        url?: string;
        element?: string;
        count?: number;
        size?: string;
        status?: number;
    }>;
    summary: {
        criticalIssues: number;
        warningIssues: number;
        infoIssues: number;
    };
    stylesheetCount: number;
    inlineStylesCount: number;
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


interface BrokenImagesState{
    brokenImages: string[];
    setBrokenImages: (results: string[]) => void;
}

// Dominator API State interfaces
interface DominatorDataState {
    dominatorData: DominatorData | null;
    setDominatorData: (data: DominatorData | null) => void;
}

interface DominatorLinksDataState {
    dominatorLinksData: DominatorLinksData | null;
    setDominatorLinksData: (data: DominatorLinksData | null) => void;
}

interface DominatorCSSDataState {
    dominatorCSSData: DominatorCSSData | null;
    setDominatorCSSData: (data: DominatorCSSData | null) => void;
}



const useUrlStore = create<UrlState>((set) => ({
  url: "",
  setUrl: (state) => set({ url: state.url }),
}));

interface TestDataState{
    testData: PageSpeedData | null;
    setTestData: (data: PageSpeedData | null) => void;
}

const useSelectedRoutesStore = create<{ selectedRoutes: string[]; setSelectedRoutes: (routes: string[]) => void }>((set) => ({
    selectedRoutes: [],
    setSelectedRoutes: (routes) => set({ selectedRoutes: routes }),
}));

const useDOMInatorSelectedRoutesStore = create<{ selectedRoutes: string[]; setSelectedRoutes: (routes: string[]) => void }>((set) => ({
    selectedRoutes: [],
    setSelectedRoutes: (routes) => set({ selectedRoutes: routes }),
}));

const useResponseDataStore = create<ResponseDataState>((set) => ({
    responseData: null,
    setResponseData: (data) => set({ responseData: data }),
}));


const useTestData = create<TestDataState>((set) => ({
    testData: null,
    setTestData: (data) => set({ testData: data }),
}));

const useAuditResultsStore = create<{ auditResults: PageSpeedData[]; setAuditResults: (results: PageSpeedData[]) => void }>((set) => ({
    auditResults: [],
    setAuditResults: (results) => set({ auditResults: results }),
}));


const useBrokenImagesStore = create<BrokenImagesState>((set) => ({
    brokenImages: [],
    setBrokenImages: (results) => set({ brokenImages: results }),
}));

// Dominator API Zustand stores
const useDominatorDataStore = create<DominatorDataState>((set) => ({
    dominatorData: null,
    setDominatorData: (data) => set({ dominatorData: data }),
}));

const useDominatorLinksDataStore = create<DominatorLinksDataState>((set) => ({
    dominatorLinksData: null,
    setDominatorLinksData: (data) => set({ dominatorLinksData: data }),
}));

const useDominatorCSSDataStore = create<DominatorCSSDataState>((set) => ({
    dominatorCSSData: null,
    setDominatorCSSData: (data) => set({ dominatorCSSData: data }),
}));

export { useBrokenImagesStore };

export { useDOMInatorSelectedRoutesStore };

export { useUrlStore };

export { useResponseDataStore };

export { useTestData };

export { useSelectedRoutesStore };

export { useAuditResultsStore };

// Export Dominator API stores
export { useDominatorDataStore };

export { useDominatorLinksDataStore };

export { useDominatorCSSDataStore };

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

// Playmaker API Response Interfaces
export interface PlaymakerResult {
    url: string;
    status: number;
    statusSeverity: 'good' | 'warn' | 'bad';
    ttfb: number;
    ttfbSeverity: 'good' | 'warn' | 'bad';
    redirects: number;
    headers: {
        cacheControl: {
            present: number;
            severity: 'good' | 'warn' | 'bad';
        };
        cors: {
            present: number;
            severity: 'good' | 'warn' | 'bad';
        };
        contentType: {
            present: number;
            severity: 'good' | 'warn' | 'bad';
        };
    };
    jsonEmpty: number;
    jsonSeverity: 'good' | 'warn' | 'bad' | 'neutral';
    loadTestAvg: number;
    loadSeverity: 'good' | 'warn' | 'bad';
}

export interface PlaymakerData {
    results: PlaymakerResult[];
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

//cap
interface BrokenImagesState{
    brokenImages: string[];
    setBrokenImages: (results: string[]) => void;
}

// Dominator API State interfaces - Updated to handle multiple routes
interface DominatorDataState {
    dominatorData: Record<string, DominatorData> | null; // Route -> Data mapping
    setDominatorData: (route: string, data: DominatorData | null) => void;
    clearAllData: () => void;
}

interface DominatorLinksDataState {
    dominatorLinksData: Record<string, DominatorLinksData> | null; // Route -> Data mapping
    setDominatorLinksData: (route: string, data: DominatorLinksData | null) => void;
    clearAllData: () => void;
}

interface DominatorCSSDataState {
    dominatorCSSData: Record<string, DominatorCSSData> | null; // Route -> Data mapping
    setDominatorCSSData: (route: string, data: DominatorCSSData | null) => void;
    clearAllData: () => void;
}

// Playmaker API State interface
interface PlaymakerDataState {
    playmakerData: PlaymakerData | null;
    setPlaymakerData: (data: PlaymakerData | null) => void;
    clearData: () => void;
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

// Dominator API Zustand stores - Updated to handle multiple routes
const useDominatorDataStore = create<DominatorDataState>((set) => ({
    dominatorData: {},
    setDominatorData: (route, data) => set((state) => ({
        dominatorData: data 
            ? { ...state.dominatorData, [route]: data }
            : Object.fromEntries(Object.entries(state.dominatorData || {}).filter(([key]) => key !== route))
    })),
    clearAllData: () => set({ dominatorData: {} }),
}));

const useDominatorLinksDataStore = create<DominatorLinksDataState>((set) => ({
    dominatorLinksData: {},
    setDominatorLinksData: (route, data) => set((state) => ({
        dominatorLinksData: data 
            ? { ...state.dominatorLinksData, [route]: data }
            : Object.fromEntries(Object.entries(state.dominatorLinksData || {}).filter(([key]) => key !== route))
    })),
    clearAllData: () => set({ dominatorLinksData: {} }),
}));

const useDominatorCSSDataStore = create<DominatorCSSDataState>((set) => ({
    dominatorCSSData: {},
    setDominatorCSSData: (route, data) => set((state) => ({
        dominatorCSSData: data 
            ? { ...state.dominatorCSSData, [route]: data }
            : Object.fromEntries(Object.entries(state.dominatorCSSData || {}).filter(([key]) => key !== route))
    })),
    clearAllData: () => set({ dominatorCSSData: {} }),
}));

// Playmaker API Zustand store
const usePlaymakerDataStore = create<PlaymakerDataState>((set) => ({
    playmakerData: null,
    setPlaymakerData: (data) => set({ playmakerData: data }),
    clearData: () => set({ playmakerData: null }),
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

// Export Playmaker API store
export { usePlaymakerDataStore };
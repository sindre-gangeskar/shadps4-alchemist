import { create } from 'zustand';

const useGlobalStateStore = create(set => ({
    libraryDirectory: null,
    shadPS4Location: null,
    error: null,
    message: null,
    type: null,
    tooltipContent: null,
    tooltipVisible: false,
    processActive: false,
    
    setMessage: value => set(() => ({ message: value })),
    setError: value => set(() => ({ error: value })),
    setType: value => set(() => ({ type: value })),
    setToolTipContent: value => set(() => ({ tooltipContent: value })),
    setToolTipVisible: value => set(() => ({ tooltipVisible: value })),
    setLibraryDirectory: value => set(() => ({ libraryDirectory: value })),
    setShadPS4Location: value => set(() => ({ shadPS4Location: value })),
    setModsDirectory: value => set(() => ({ modsDirectory: value })),
    setProcessActive: value => set(() => ({ processActive: value }))
}))

export default useGlobalStateStore;
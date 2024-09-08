import { create } from 'zustand';

const useGlobalStateStore = create(set => ({
    libraryDirectory: null,
    shadPS4Location: null,
    error: null,
    tooltipContent: null,
    tooltipVisible: false,

    setError: value => set(() => ({ error: value })),
    setToolTipContent: value => set(() => ({ tooltipContent: value })),
    setToolTipVisible: value => set(() => ({ tooltipVisible: value })),
    setLibraryDirectory: value => set(() => ({ libraryDirectory: value })),
    setShadPS4Location: value => set(() => ({ shadPS4Location: value })),
    setModsDirectory: value => set(() => ({ modsDirectory: value }))
}))

export default useGlobalStateStore;
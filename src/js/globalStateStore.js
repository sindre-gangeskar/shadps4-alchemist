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
    fullscreen: false,
    isPS4Pro: false,
    showSplash: false,
    screenWidth: 1280,
    screenHeight: 720,
    vBlankDivider: 1,
    logType: "async",

    // Simplified setters
    setMessage: message => set({ message }),
    setError: error => set({ error }),
    setType: type => set({ type }),
    setFullscreen: fullscreen => set({ fullscreen }),
    setToolTipContent: tooltipContent => set({ tooltipContent }),
    setToolTipVisible: tooltipVisible => set({ tooltipVisible }),
    setLibraryDirectory: libraryDirectory => set({ libraryDirectory }),
    setShadPS4Location: shadPS4Location => set({ shadPS4Location }),
    setModsDirectory: modsDirectory => set({ modsDirectory }),
    setProcessActive: processActive => set({ processActive }),
    setIsPS4Pro: isPS4Pro => set({ isPS4Pro }),
    setShowSplash: showSplash => set({ showSplash }),
    setScreenWidth: screenWidth => set({ screenWidth }),
    setScreenHeight: screenHeight => set({ screenHeight }),
    setvBlankDivider: vBlankDivider => set({ vBlankDivider }),  // Fixed typo from VBlankProvider to VBlankDivider
    setLogType: logType => set({ logType })
}));

export default useGlobalStateStore;

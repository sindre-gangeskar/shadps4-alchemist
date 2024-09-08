class Utils {
    delay = async (seconds) => {
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, seconds * 1000)
        })
    }
}

export default Utils;
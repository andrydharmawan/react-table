export async function useDelay(s: number, callback: Function = () => { }) {
    const ms = s * 1000;
    return new Promise(resolve => {
        let secondsPassed = 0;
        let interval = setInterval(() => {
            callback()
            if (secondsPassed === 9) {
                clearInterval(interval);
            }
        }, 1000)
        setTimeout(async () => {
            await callback()
            resolve(true)
        }, ms);
    });
}
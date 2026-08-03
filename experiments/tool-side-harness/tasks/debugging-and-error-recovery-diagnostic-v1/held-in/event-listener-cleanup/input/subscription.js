export function connect(emitter,onData){emitter.on('data',onData);return ()=>emitter.off('close',onData)}

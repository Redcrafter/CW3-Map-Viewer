
declare module LZMA {
    export function decompress(byte_arr: ArrayLike<number>, on_finish: (result: Uint8Array | string) => any, on_progress?: (percent) => any);
    export function compress(mixed: string | ArrayLike<number>, mode: number, on_finish: (result, error) => any, on_progress?: (percent) => any);
}

declare module Zlib {
    class Gunzip {
        constructor(compressed: number[] | Uint8Array);
        decompress(): Uint8Array;
    }
}

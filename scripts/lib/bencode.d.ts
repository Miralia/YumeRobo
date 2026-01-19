declare module 'bencode' {
    interface Bencode {
        encode(data: unknown): Uint8Array;
        decode(data: Uint8Array | Buffer): unknown;
        byteLength(data: unknown): number;
        encodingLength(data: unknown): number;
    }
    const bencode: Bencode;
    export default bencode;
}

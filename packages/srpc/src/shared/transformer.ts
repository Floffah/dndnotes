export interface TransformerLike {
    serialize: (value: any) => any;
    deserialize: (value: any) => any;
}

export const defaultTransformer: TransformerLike = {
    serialize: (value) => value,
    deserialize: (value) => value,
};

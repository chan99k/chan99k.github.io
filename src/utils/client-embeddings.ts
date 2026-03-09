import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers';

const MODEL = 'Xenova/all-MiniLM-L6-v2';

let cachedPipeline: FeatureExtractionPipeline | null = null;
let loadingPromise: Promise<FeatureExtractionPipeline> | null = null;

export type EmbeddingStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Load the embedding model (cached after first call).
 * Safe to call multiple times — concurrent calls share the same promise.
 */
export async function loadEmbeddingModel(
    onStatus?: (status: EmbeddingStatus) => void,
): Promise<FeatureExtractionPipeline> {
    if (cachedPipeline) {
        onStatus?.('ready');
        return cachedPipeline;
    }

    if (loadingPromise) {
        onStatus?.('loading');
        return loadingPromise;
    }

    onStatus?.('loading');
    loadingPromise = pipeline('feature-extraction', MODEL)
        .then((p) => {
            cachedPipeline = p;
            loadingPromise = null;
            onStatus?.('ready');
            return p;
        })
        .catch((err) => {
            loadingPromise = null;
            onStatus?.('error');
            throw err;
        });

    return loadingPromise;
}

/**
 * Compute a 384-dim embedding vector for the given text.
 * Loads the model on first call (~5MB download).
 */
export async function getQueryEmbedding(
    text: string,
    onStatus?: (status: EmbeddingStatus) => void,
): Promise<number[]> {
    const extractor = await loadEmbeddingModel(onStatus);
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data as Float32Array);
}

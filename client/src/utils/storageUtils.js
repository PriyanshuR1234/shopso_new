import supabase from "../utils/supabaseClient";

/**
 * Extracts the file path from a Supabase public URL.
 * @param {string} url - The public URL of the file.
 * @param {string} bucket - The name of the bucket.
 * @returns {string|null} - The file path within the bucket, or null if it doesn't match.
 */
export const getPathFromUrl = (url, bucket = "product-images") => {
    if (!url) return null;
    const parts = url.split(`/public/${bucket}/`);
    return parts.length > 1 ? parts[1] : null;
};

/**
 * Deletes a file from Supabase Storage given its public URL.
 * @param {string} url - The public URL of the file to delete.
 * @param {string} bucket - The name of the bucket (default: "product-images").
 */
export const deleteFileByUrl = async (url, bucket = "product-images") => {
    const path = getPathFromUrl(url, bucket);
    if (!path) return;

    try {
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error) {
            console.error(`Failed to delete file: ${path}`, error);
        }
    } catch (err) {
        console.error(`Error deleting file: ${path}`, err);
    }
};

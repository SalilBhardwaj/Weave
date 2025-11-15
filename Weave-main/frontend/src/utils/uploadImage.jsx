import { gqlUploadImage } from '../graphql/gqlFunctions.js';

export const uploadImage = async (file, path) => {
    try {
        const contentType = file.type || 'application/octet-stream';
        const { data } = await gqlUploadImage(path, contentType)

        if (!data?.getUploadUrl?.success) {
            throw new Error('Failed to get upload URL');
        }
        const { url, key } = data.getUploadUrl;

        const putRes = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': contentType },
            body: file,
        });

        if (!putRes.ok) {
            console.log(putRes);
            throw new Error(`Upload failed: ${putRes.statusText}`);
        }
        const cloudFrontUrl = `${import.meta.env.VITE_CLOUD_URL}/${key}`;
        console.log('Upload successful:', cloudFrontUrl);
        return cloudFrontUrl;

    } catch (error) {
        console.error('Image upload error:', error);
        throw error;
    }
};
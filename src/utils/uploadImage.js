import { getApiUrl } from '../config/api';

/**
 * Upload an image file to the admin upload endpoint (Cloudinary-backed)
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} Resolves with the secure URL of the uploaded image
 */
export async function uploadImage(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(getApiUrl('/api/admin/upload'), {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await safeParseError(response);
    throw new Error(error || 'Failed to upload image');
  }

  const data = await response.json();
  if (!data?.url) {
    throw new Error('Upload response missing URL');
  }

  return data.url;
}

async function safeParseError(response) {
  try {
    const data = await response.clone().json();
    return data?.error;
  } catch (err) {
    return null;
  }
}

export default uploadImage;

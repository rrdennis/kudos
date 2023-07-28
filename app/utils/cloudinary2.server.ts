import type { UploadHandler } from '@remix-run/node';
import { unstable_parseMultipartFormData } from '@remix-run/node';
import { writeAsyncIterableToWritable } from '@remix-run/node';

import type {
  UploadApiResponse,
  UploadStream,
} from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function uploadImageToCloudinary(
  data: AsyncIterable<Uint8Array>
) {
  const uploadPromise = new Promise<UploadApiResponse>(
    async (resolve, reject) => {
      const uploadStream: UploadStream =
        cloudinary.uploader.upload_stream(
          {},
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }
            if (result) {
              resolve(result);
            }
          }
        );
      await writeAsyncIterableToWritable(
        data,
        uploadStream
      );
    }
  );

  return uploadPromise;
}

const uploadHandler: UploadHandler = async ({ 
  name, contentType, data, filename 
}) => {
  if (name !== 'profile-pic') {
    return undefined;
  }

  if (filename) {
    const { secure_url } = await uploadImageToCloudinary(data);
    return secure_url;
  }
};

export async function uploadAvatar(request: Request) {
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const fileLocation = formData.get('profile-pic')?.toString() || '';

  return fileLocation;
}

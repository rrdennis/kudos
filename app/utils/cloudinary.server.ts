import type {
  ActionArgs,
  UploadHandler,
} from '@remix-run/node'; // or cloudflare/deno
import {
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
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

export const action = async ({ request }: ActionArgs) => {
  const uploadHandler: UploadHandler = unstable_composeUploadHandlers(
    async ({ name, contentType, data, filename }) => {
      if (name !== 'profile-pic') {
        return undefined;
      }
      const uploadedImage = await uploadImageToCloudinary(
        data
      );
      return uploadedImage.secure_url;
    },
  );

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const imageUrl = formData.get('profile-pic');

  return imageUrl;
};

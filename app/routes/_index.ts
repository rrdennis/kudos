import type { 
  LoaderFunction,
  V2_MetaFunction
} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { requireUserId } from '~/utils/auth.server'

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Kudos" },
    { name: "description", content: "Welcome to Kudos!" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  // If user is not logged in, redirect to `/login`
  await requireUserId(request);
  // If user is logged in, redirect to `/home`
  return redirect('/home');
};

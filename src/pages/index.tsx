import { createServerSideHelpers } from "@trpc/react-query/server";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getSession, signOut, useSession } from "next-auth/react";
import { UnsignedHome } from "~/components/UnsignedHome";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Home(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { user, challenges } = props;
  const router = useRouter();

  return (
    <>
      {!props.user ? (
        <UnsignedHome />
      ) : (
        <div>
          {user?.verified || user?.userType === "TEACHER" ? (
            <div className="flex min-h-screen">
              <div className="w-8/9  container mx-auto my-12 px-8 py-6 md:px-12 ">
                <div className="-mx-1 flex flex-wrap lg:-mx-4 ">
                  {challenges?.map((challenge, i) => (
                    <div
                      key={i}
                      className="my-1 w-full px-1 md:w-1/2 lg:my-4 lg:w-1/3 lg:px-4"
                    >
                      <article className="overflow-hidden rounded-2xl border border-zinc-800 shadow-xl ">
                        <h1 className="font-inte block h-auto w-full border-b border-yellow-300 bg-slate-900 px-4 py-6 pb-36 text-3xl font-semibold">
                          {challenge.name}
                        </h1>

                        <header className="flex items-center justify-between bg-zinc-800 p-2 leading-tight md:p-4">
                          <h1 className="text-lg">
                            <p className="no-underline hover:underline">
                              {challenge.desc}
                            </p>
                          </h1>
                        </header>
                      </article>
                    </div>
                  ))}
                </div>
              </div>
              <div className=" sticky flex w-1/6 flex-col items-center bg-zinc-800 ">
                <div className="mb-12 flex items-center justify-center px-4 py-12">
                  <Image
                    src={user.image as string}
                    alt={user.name as string}
                    width={45}
                    height={45}
                    className="rounded-full "
                  />
                  <h1 className="ml-4 text-xl">{user.name}</h1>
                </div>
                <div className="mb-auto">
                  {user.userType === "STUDENT" ? (
                    <h1 className="text-lg text-gray-400">Coming soon..</h1>
                  ) : null}
                </div>
                {user.userType === "TEACHER" ? (
                  <div
                    onClick={() => router.push("/beaver-admin")}
                    className="w-full bg-yellow-500 py-3 text-center duration-200 hover:cursor-pointer hover:bg-yellow-600"
                  >
                    <h1 className="text-xl text-gray-100">Admin Portal</h1>
                  </div>
                ) : null}
                <div
                  onClick={() => signOut()}
                  className="w-full bg-red-500 py-3 text-center duration-200 hover:cursor-pointer hover:bg-red-600"
                >
                  <h1 className="text-xl text-gray-100">Sign Out</h1>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-screen items-center justify-center">
              <h1 className="text-2xl">
                You are not a verified student! Please contact the instructors
                on Discord to be verified.
              </h1>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  if (!session?.user) {
    return {
      props: {},
    };
  }

  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({
      session: session,
    }),
  });

  const user = await ssg.user.getUser.fetch();
  const challenges = await ssg.challenges.getAll.fetch();

  return {
    props: {
      user: user,
      challenges: challenges,
    },
  };
}

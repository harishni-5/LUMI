import { SignUp } from "@clerk/nextjs";

export default function Page(){
    return (
        <div className="flex h-screen items-center justify-center my-10">
            <SignUp forceRedirectUrl="/dashboard"/>
        </div>
    )
}
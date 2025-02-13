import { getServerSession } from "next-auth"

import { APP_NAME, AI_TAGLINE, APP_VANITY_URL } from "@/app-global"

import Typography from "@/components/typography"

import { MiniMenu } from "@/features/ui/mini-menu"
import { SVGLogo } from "@/features/ui/svg-logo"
import { SVGLogoScaled } from "@/features/ui/svg-logo-scaled"
import { UserLoginLogout } from "@/features/ui/user-login-logout"

const Sidebar: React.FC = () => {
  return (
    <div className="bg-altBackground">
      <div className="container justify-center py-2">
        <div className="grid grid-cols-12 items-center">
          <div className="col-span-2 hidden justify-self-center border-r-2 border-r-accent md:col-span-3 md:block lg:col-span-2">
            <SVGLogo className="hidden scale-75 md:block" />
          </div>
          <div className="col-span-5 px-4 font-meta">
            <Typography variant="h1" className="font-bold tracking-wider text-siteTitle">
              {APP_NAME}
            </Typography>
            <Typography variant="h2" className="hidden whitespace-nowrap text-textMuted md:block">
              {AI_TAGLINE}
            </Typography>
          </div>
          <div className="col-span-5"></div>
        </div>
      </div>
    </div>
  )
}

export const Header: React.FC = async () => {
  const session = await getServerSession()

  return (
    <header className="flex w-full flex-col bg-darkbackground text-white">
      <div className="container flex h-14 items-center justify-between">
        <div className="hidden md:grid md:w-full md:grid-cols-12 md:items-center">
          <div className="col-span-2 justify-self-center">
            <Typography variant="span" ariaLabel={"Site domain:" + APP_VANITY_URL}>
              {APP_VANITY_URL}
            </Typography>
          </div>
          <div className="col-span-8 justify-self-center"></div>
          <div className="col-span-2 justify-self-end">
            <UserLoginLogout session={session} />
          </div>
        </div>
        <div className="grid w-full grid-cols-12 md:hidden">
          <div className="col-span-4 flex justify-self-center">
            <SVGLogoScaled />
          </div>
          <div className="col-span-4 flex justify-self-center"></div>
          <div className="col-span-4 flex justify-self-end">
            <MiniMenu />
          </div>
        </div>
      </div>
      <Sidebar />
    </header>
  )
}

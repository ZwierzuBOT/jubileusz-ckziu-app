'use client'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

const Page = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/sign-in')
    }
  },[])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="w-full h-[87vh] flex flex-col justify-center items-center">
        <div className="lg:w-[10%] md:w-[15%] sm:w-[40%] w-[40%] h-[10%] flex justify-evenly items-center">
          <div className="loadingPart loadingPart1 max-w-4 min-w-2 h-[50%]" />
          <div className="loadingPart loadingPart2 max-w-4 min-w-2 h-[50%]" />
          <div className="loadingPart loadingPart3 max-w-4 min-w-2 h-[50%]" />
          <div className="loadingPart loadingPart4 max-w-4 min-w-2 h-[50%]" />
          <div className="loadingPart loadingPart5 max-w-4 min-w-2 h-[50%]" />
        </div>
        <h1 className="text-gray-700 lg:text-3xl md:text-2xl sm:text-xl">Prosze Czekać</h1>
      </div>
    )
  } else {
    return (
      <div className="text-black">
        Regulamin
      </div>
    )
  }
}

export default Page

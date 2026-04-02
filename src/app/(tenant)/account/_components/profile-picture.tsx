"use client"

import { ChangeEvent, useEffect, useRef, useState } from "react"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Camera } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import { UserProfile } from "./user-data-type"

type ProfilePictureProps = {
  profile?: UserProfile
  token?: string
  onProfileUpdated: () => Promise<void> | void
}

const fallbackImage = "/assets/images/no-user.jpeg"
const userMeQueryKey = ["user-me"] as const

const  ProfilePicture = ({ profile, token, onProfileUpdated }: ProfilePictureProps) => {
  const queryClient = useQueryClient()
  const [profileImage, setProfileImage] = useState(profile?.profileImage || fallbackImage)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setProfileImage(profile?.profileImage || fallbackImage)
  }, [profile?.profileImage])

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-profile-image"],
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/upload-avatar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.status) {
        throw new Error(result.message || "Upload failed")
      }

      return result
    },
    onSuccess: async data => {
      toast.success(data?.message || "Profile image updated successfully!")
      await queryClient.invalidateQueries({
        queryKey: userMeQueryKey,
      })
      await onProfileUpdated()
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : "Upload failed")
    },
  })

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!token) {
      toast.error("You need to sign in again to upload your profile image.")
      return
    }

    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImage(reader.result as string)
    }
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append("profileImage", file, file.name)
    mutate(formData)
  }

  return (
    <div className="flex items-center justify-center rounded-[8px] bg-white p-4 shadow-[0_4px_8px_rgba(0,0,0,0.12)]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-fit rounded-full border-4 border-[#F7F8F8] bg-cover bg-center bg-no-repeat shadow-[0_4px_15px_rgba(0,0,0,0.10)]">
          <div className="relative">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border">
              <Image
                src={profileImage}
                alt="Profile"
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute -bottom-2 -right-2 flex gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />

              <Button
                type="button"
                size="sm"
                className="h-8 w-8 rounded-full bg-primary p-0"
                title="Upload new image"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h4 className="pb-1 text-xl font-semibold leading-normal text-[#191919] md:text-2xl text-center">
            {profile?.firstName || "N/A"} {profile?.lastName || "N/A"}
          </h4>
          <p className="text-base font-normal leading-normal text-[#191919] text-center">{profile?.email || "N/A"}</p>
        </div>
      </div>
    </div>
  )
}

export default ProfilePicture

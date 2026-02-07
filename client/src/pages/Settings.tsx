import React from 'react'
import { AccountSettingsCards } from "@daveyplate/better-auth-ui"
import { ChangePasswordCard } from "@daveyplate/better-auth-ui"
import { DeleteAccountCard } from "@daveyplate/better-auth-ui"

const Settings = () => {
  return (
    <div className='flex flex-col gap-7 justify-center items-center h-full p-4 w-[40%] mx-auto'>
        <AccountSettingsCards></AccountSettingsCards>
        <div className='w-full'>
        <ChangePasswordCard />
        </div>
        <div className='w-full'>
        <DeleteAccountCard />
        </div>
    </div>
  )
}

export default Settings
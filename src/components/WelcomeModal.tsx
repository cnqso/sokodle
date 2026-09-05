'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { getLocalStorage, setLocalStorage } from '../lib/localStorageHelpers'
import TileSprite from '@/components/TileSprite'

export default function WelcomeModal() {
    // Local storage key for “Don’t show this again”
    const DIALOG_KEY = 'sokodleDontShowWelcome'
  
    // On mount, read the local storage key to see if the user opted out
    const [open, setOpen] = useState(() => {
      const dontShow = getLocalStorage<boolean>(DIALOG_KEY, false)
      return !dontShow // If user said “don’t show,” this returns false => not open
    })
  
    // Track the checkbox state while user is interacting
    const [dontShow, setDontShow] = useState(false)
  
    function handleOk() {
      if (dontShow) {
        // User checked “Don’t show again” => store in localStorage
        setLocalStorage(DIALOG_KEY, true)
      }
      setOpen(false) // close dialog
    }
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className={'font-display'}>Welcome to Sokodle!</DialogTitle>
            <DialogDescription>
              A little guinea pig. A lot of carrots. Push a carrot into every bowl without getting stuck.
            </DialogDescription>
          </DialogHeader>
  
          <div className="space-y-3 py-4">
            <div className="grid grid-cols-[40px,1fr] items-center gap-2">
              <TileSprite kind="keeper" className="justify-self-center h-8 w-8" />
              <p className="text-sm leading-none">
                You, a guinea pig! Swipe anywhere on the board, use arrow keys, or tap an adjacent tile.
              </p>
            </div>
  
            <div className="grid grid-cols-[40px,1fr] items-center gap-2">
              <TileSprite kind="wall" className="justify-self-center h-8 w-8" />
              <p className="text-sm leading-none">Garden walls block movement.</p>
            </div>
  
            <div className="grid grid-cols-[40px,1fr] items-center gap-2">
              <TileSprite kind="cell" className="justify-self-center h-8 w-8" />
              <p className="text-sm leading-none">Push the carrots.</p>
            </div>
  
            <div className="grid grid-cols-[40px,1fr] items-center gap-2">
              <TileSprite kind="dock" className="justify-self-center h-8 w-8" />
              <p className="text-sm leading-none">
                Put a carrot in every bowl.
              </p>
            </div>
  
            {/* “Don’t show this again” checkbox */}
            <div className="grid grid-cols-[40px,1fr] items-center gap-2 pt-2">
              <Checkbox
                id="dontShow"
                checked={dontShow}
                onCheckedChange={(checked) => setDontShow(Boolean(checked))}
                className="justify-self-center"
              />
              <Label htmlFor="dontShow" className="text-sm">
                Don&apos;t show this again
              </Label>
            </div>
          </div>
  
          <DialogFooter>
            <Button type="button" onClick={handleOk}>
              OK!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

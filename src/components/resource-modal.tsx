'use client'

import { useCallback, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Textarea } from './ui/textarea';
import { secondsToDuration } from '@jerry/utils/time';
import { useToast } from '@jerry/hooks/use-toast';
import { redirect } from 'next/navigation';

const DEFAULT_DURATION_SECONDS = 21600

export function CreateResourceModal() {

  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const [durationPreview, setDurationPreview] = useState(() => secondsToDuration(21600))
  const nameRef = useRef<HTMLInputElement | null>(null)
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null)
  const [expiryValue, setExpiryValue] = useState([DEFAULT_DURATION_SECONDS])

  const [isLoading, setIsLoading] = useState(false)
  const [errorText, setErrorText] = useState('')

  const onDurationChange = useCallback((val: number[]) => {
    setDurationPreview(secondsToDuration(val[0]))
  }, [])

  const submitCreation = useCallback(() => {
    async function createResource() {
      const resourceInfo = {
        name: nameRef.current?.value,
        description: descriptionRef.current?.value,
        defaultClaimTime: expiryValue[0]
      }

      const res = await fetch('/api/resources', {method: 'POST', body: JSON.stringify(resourceInfo)})
      try {
        const body = await res.json()
        if (res.status !== 200) {
          console.log(body.message)
          throw new Error('Failed to create resource')
        }
        if (body.id) {
          toast({title: 'Resource created', description: `Created resource: ${resourceInfo.name}. Click to view it`, onClick: () => redirect(`/resources/${body.id}`) })
        }
        setOpen(false)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setErrorText('Error creating resource')
      } finally {
        setIsLoading(false)
      }
    }

    if (!nameRef.current?.value) {
      return
    }

    setIsLoading(true)
    setErrorText('')
    void createResource()
  }, [expiryValue, toast])

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setErrorText('')
    setOpen(isOpen)
  }, [])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger style={{color: '#333'}}>Create new resource</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle style={{color: '#333'}}>New Resource</DialogTitle>
        </DialogHeader>
        <div className="py-4" style={{width:'100%', display: 'flex', flexDirection:'column', gap: '1rem', alignItems: 'start', color: '#333'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '6rem', width:'100%'}}>
            <Label htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              placeholder='Resource name'
              ref={nameRef}
              disabled={isLoading}
            />
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '6rem', width:'100%'}}>
            <Label htmlFor="description">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder='(Optional) description'
              ref={descriptionRef}
              disabled={isLoading}
            />
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '6rem', width:'100%'}}>
            <Label htmlFor="default_expiration_seconds">
              Default&nbsp;Claim&nbsp;Expiration&nbsp;({durationPreview})
            </Label>
            <Slider
              id="default_expiration_seconds"
              defaultValue={[DEFAULT_DURATION_SECONDS]}
              onValueCommit={onDurationChange}
              min={60*60} // 1 hour
              max={60*60*24*2} // 2 days
              step={60*60} // hours 
              value={expiryValue}
              onValueChange={setExpiryValue}
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter style={{flexDirection: 'column'}}>
          <Button type="button" onClick={submitCreation} disabled={isLoading}>Create</Button>
          <br />
          <span style={{color: '#f00'}}>{errorText}</span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

}
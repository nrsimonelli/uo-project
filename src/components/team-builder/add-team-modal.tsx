import { useState } from 'react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useModalState } from '@/hooks/use-modal-state'

export function AddTeamModal({
  handleNewTeam,
}: {
  handleNewTeam: (name: string) => void
}) {
  const { open, closeModal, setOpen } = useModalState()
  const [teamName, setTeamName] = useState('')

  const onClick = () => {
    handleNewTeam(teamName)
    closeModal()
    setTeamName('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create new team</Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby='modal-description'
        className='sm:max-w-md max-h-[80vh] h-full w-full overflow-hidden flex flex-col items-start'
      >
        <DialogHeader>
          <DialogTitle>Build your team</DialogTitle>
        </DialogHeader>
        <div>
          <Label
            htmlFor={'new-team-name'}
            className='block text-xs font-medium mb-1'
          >
            Team name
          </Label>
          <Input
            id={'new-team-name'}
            placeholder='Your team name...'
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
        </div>
        <Button disabled={!teamName} onClick={onClick}>
          Save
        </Button>
      </DialogContent>
    </Dialog>
  )
}

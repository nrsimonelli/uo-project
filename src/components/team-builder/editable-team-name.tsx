import { useState } from 'react'
import { Check, X, Edit2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface EditableTeamNameProps {
  teamName: string
  onSave: (newName: string) => void
  className?: string
}

export const EditableTeamName = ({ teamName, onSave, className }: EditableTeamNameProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(teamName)
  const [isHovered, setIsHovered] = useState(false)

  const handleSave = () => {
    if (editValue.trim() && editValue !== teamName) {
      onSave(editValue.trim())
    }
    setIsEditing(false)
    setEditValue(teamName)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(teamName)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditValue(teamName)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-lg font-semibold"
          autoFocus
          onBlur={handleSave}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          className="h-8 w-8 p-0"
        >
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-2 group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h1 className="text-2xl font-bold">{teamName}</h1>
      {isHovered && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleEdit}
          className="h-8 w-8 p-0 opacity-70 hover:opacity-100"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
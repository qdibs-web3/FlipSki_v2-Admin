import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  XCircle,
  AlertTriangle 
} from 'lucide-react'
import { ETH_ADDRESS } from '../lib/web3'

export function TokenList({ 
  tokens, 
  onUpdateToken, 
  onRemoveToken, 
  onTogglePause, 
  isLoading 
}) {
  const [editingToken, setEditingToken] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [removeDialog, setRemoveDialog] = useState(null)

  const handleEditClick = (token) => {
    setEditingToken(token.address)
    setEditForm({
      minWager: token.minWagerFormatted,
      maxWager: token.maxWagerFormatted,
    })
  }

  const handleEditSave = async () => {
    const token = tokens.find(t => t.address === editingToken)
    if (!token) return

    try {
      await onUpdateToken(
        token.address,
        editForm.minWager,
        editForm.maxWager,
        token.isActive,
        token.isPaused,
        token.decimals
      )
      setEditingToken(null)
      setEditForm({})
    } catch (error) {
      console.error('Failed to update token:', error)
    }
  }

  const handleRemoveClick = (token) => {
    setRemoveDialog(token)
  }

  const handleRemoveConfirm = async () => {
    if (!removeDialog) return

    try {
      await onRemoveToken(removeDialog.address)
      setRemoveDialog(null)
    } catch (error) {
      console.error('Failed to remove token:', error)
    }
  }

  const formatAddress = (address) => {
    if (address === ETH_ADDRESS) return 'ETH (Native)'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getStatusBadge = (token) => {
    if (!token.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    if (token.isPaused) {
      return <Badge variant="destructive">Paused</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No tokens configured yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add your first token to get started.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Min Wager</TableHead>
              <TableHead>Max Wager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.address}>
                <TableCell className="font-medium">{token.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{token.symbol}</Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formatAddress(token.address)}
                </TableCell>
                <TableCell>
                  {editingToken === token.address ? (
                    <Input
                      type="number"
                      step="any"
                      value={editForm.minWager}
                      onChange={(e) => setEditForm(prev => ({ ...prev, minWager: e.target.value }))}
                      className="w-24"
                    />
                  ) : (
                    `${token.minWagerFormatted} ${token.symbol}`
                  )}
                </TableCell>
                <TableCell>
                  {editingToken === token.address ? (
                    <Input
                      type="number"
                      step="any"
                      value={editForm.maxWager}
                      onChange={(e) => setEditForm(prev => ({ ...prev, maxWager: e.target.value }))}
                      className="w-24"
                    />
                  ) : (
                    `${token.maxWagerFormatted} ${token.symbol}`
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(token)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editingToken === token.address ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleEditSave}
                          disabled={isLoading}
                        >
                          {isLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingToken(null)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(token)}
                          disabled={isLoading}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onTogglePause(token.address, !token.isPaused)}
                          disabled={isLoading || !token.isActive}
                        >
                          {token.isPaused ? (
                            <Play className="h-3 w-3" />
                          ) : (
                            <Pause className="h-3 w-3" />
                          )}
                        </Button>
                        {token.address !== ETH_ADDRESS && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveClick(token)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Remove Token Dialog */}
      <Dialog open={!!removeDialog} onOpenChange={() => setRemoveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remove Token
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {removeDialog?.name} ({removeDialog?.symbol})? 
              This will deactivate the token and prevent new wagers, but historical data will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialog(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRemoveConfirm}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, RefreshCw, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { supabaseDb } from '@/lib/supabase-db';

interface NewBatchResetDialogProps {
  onReset?: () => void; // called after a successful reset so parent can refresh data
}

type Step = 'idle' | 'confirm' | 'running' | 'done' | 'error';

const CONFIRM_WORD = 'RESET';

export const NewBatchResetDialog = ({ onReset }: NewBatchResetDialogProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('idle');
  const [checked, setChecked] = useState(false);
  const [typed, setTyped] = useState('');
  const [resultMessage, setResultMessage] = useState('');

  const canProceed = checked && typed === CONFIRM_WORD;

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) resetState();
  };

  const resetState = () => {
    setStep('idle');
    setChecked(false);
    setTyped('');
    setResultMessage('');
  };

  const handleReset = async () => {
    if (!canProceed) return;
    setStep('running');

    const result = await supabaseDb.resetForNewBatch();

    if (result.success) {
      setStep('done');
      setResultMessage(result.details);
      onReset?.();
    } else {
      setStep('error');
      setResultMessage(result.details);
    }
  };

  const handleClose = () => {
    setOpen(false);
    resetState();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          id="new-batch-reset-trigger"
          variant="destructive"
          size="sm"
          className="flex-1 sm:flex-none gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Start New Batch
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => {
        // Prevent dismissing during the operation
        if (step === 'running') e.preventDefault();
      }}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-left text-destructive">
                Start a New Batch
              </DialogTitle>
              <DialogDescription className="text-left mt-0.5">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step: idle → confirm */}
        {(step === 'idle' || step === 'confirm') && (
          <div className="space-y-4 py-2">
            {/* What will be cleared */}
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
              <p className="text-sm font-semibold text-destructive">What will be cleared:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>All student enrollments</li>
                <li>Teacher assignments per student</li>
              </ul>
            </div>

            {/* What will be kept */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">What will be preserved:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>All student &amp; staff accounts</li>
                <li>All exam records &amp; scores</li>
                <li>Class content &amp; videos</li>
                <li>Teacher–church assignments</li>
                <li>App settings (exam lock, etc.)</li>
              </ul>
            </div>

            {/* Checkbox acknowledgement */}
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Checkbox
                id="batch-reset-ack"
                checked={checked}
                onCheckedChange={(v) => {
                  setChecked(!!v);
                  setStep('confirm');
                }}
                className="mt-0.5"
              />
              <Label htmlFor="batch-reset-ack" className="text-sm cursor-pointer leading-relaxed">
                I understand this will permanently delete all enrollment and exam data for the current batch.
              </Label>
            </div>

            {/* Confirm word input */}
            {checked && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label htmlFor="batch-reset-confirm" className="text-sm text-muted-foreground">
                  Type <span className="font-mono font-bold text-destructive">{CONFIRM_WORD}</span> to confirm:
                </Label>
                <Input
                  id="batch-reset-confirm"
                  placeholder={CONFIRM_WORD}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value.toUpperCase())}
                  className={`font-mono ${typed === CONFIRM_WORD ? 'border-destructive ring-1 ring-destructive/40' : ''}`}
                  autoComplete="off"
                />
              </div>
            )}
          </div>
        )}

        {/* Step: running */}
        {step === 'running' && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div>
              <p className="font-medium">Resetting data…</p>
              <p className="text-sm text-muted-foreground mt-1">
                Clearing enrollments and exam records. Please wait.
              </p>
            </div>
          </div>
        )}

        {/* Step: done */}
        {step === 'done' && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <div>
              <p className="font-semibold text-lg">Batch reset complete!</p>
              <p className="text-sm text-muted-foreground mt-1">{resultMessage}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Students can now re-enroll for the new batch. All exam records are intact.
              </p>
            </div>
          </div>
        )}

        {/* Step: error */}
        {step === 'error' && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <XCircle className="h-12 w-12 text-destructive" />
            <div>
              <p className="font-semibold text-lg">Reset failed</p>
              <p className="text-sm text-muted-foreground mt-1">{resultMessage}</p>
              <p className="text-sm text-muted-foreground mt-1">
                No data was changed. Please check your connection and try again.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {(step === 'done' || step === 'error') && (
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          )}

          {(step === 'idle' || step === 'confirm') && (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReset}
                disabled={!canProceed}
                className="flex-1 gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Batch Data
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

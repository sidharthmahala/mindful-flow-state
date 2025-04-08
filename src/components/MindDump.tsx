
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PenLine, Save, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { TaskMood } from '@/types/task';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  mood?: TaskMood;
}

const MindDump = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedMood, setSelectedMood] = useState<TaskMood | undefined>(undefined);
  const { toast } = useToast();
  
  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('clarity-notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to parse notes from localStorage:', e);
      }
    }
  }, []);
  
  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('clarity-notes', JSON.stringify(notes));
  }, [notes]);
  
  const handleSaveNote = () => {
    if (!currentNote.trim()) return;
    
    const newNote: Note = {
      id: crypto.randomUUID(),
      content: currentNote.trim(),
      createdAt: new Date().toISOString(),
      mood: selectedMood
    };
    
    setNotes(prev => [newNote, ...prev]);
    setCurrentNote('');
    setSelectedMood(undefined);
    
    toast({
      title: "Note saved",
      description: "Your thoughts have been captured.",
      duration: 2000,
    });
  };
  
  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    
    toast({
      title: "Note deleted",
      description: "Your note has been removed.",
      duration: 2000,
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  const getMoodEmoji = (mood?: TaskMood) => {
    switch (mood) {
      case 'great': return '😊';
      case 'good': return '🙂';
      case 'neutral': return '😐';
      case 'difficult': return '😕';
      case 'challenging': return '😓';
      case 'energizing': return '⚡';
      case 'draining': return '🔋';
      case 'creative': return '💡';
      default: return '';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="zen-card p-4">
        <Textarea
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          placeholder="What's on your mind? Write freely..."
          className="border-none bg-transparent focus:ring-0 resize-none min-h-[120px] placeholder:text-muted-foreground/70"
        />
        
        <div className="mt-3">
          <div className="mb-3">
            <p className="text-sm text-muted-foreground mb-2">How are you feeling?</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className={selectedMood === 'great' ? "bg-amber-50" : ""}
                onClick={() => setSelectedMood('great')}
              >
                😊 Great
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={selectedMood === 'good' ? "bg-green-50" : ""}
                onClick={() => setSelectedMood('good')}
              >
                🙂 Good
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={selectedMood === 'neutral' ? "bg-blue-50" : ""}
                onClick={() => setSelectedMood('neutral')}
              >
                😐 Neutral
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={selectedMood === 'difficult' ? "bg-orange-50" : ""}
                onClick={() => setSelectedMood('difficult')}
              >
                😕 Difficult
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={selectedMood === 'energizing' ? "bg-lime-50" : ""}
                onClick={() => setSelectedMood('energizing')}
              >
                ⚡ Energizing
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={selectedMood === 'creative' ? "bg-cyan-50" : ""}
                onClick={() => setSelectedMood('creative')}
              >
                💡 Creative
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              disabled={!currentNote.trim()}
              onClick={handleSaveNote}
              className="bg-zen hover:bg-zen-focus text-zen-foreground"
            >
              <Save className="w-4 h-4 mr-2" /> Save Note
            </Button>
          </div>
        </div>
      </div>
      
      {notes.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-medium">Your Notes</h2>
          {notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-muted-foreground">
                      {formatDate(note.createdAt)}
                      {note.mood && <span className="ml-2">{getMoodEmoji(note.mood)}</span>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="whitespace-pre-wrap">{note.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <PenLine className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No notes yet</p>
          <p className="text-sm mt-1">Write down your thoughts to clear your mind</p>
        </div>
      )}
    </div>
  );
};

export default MindDump;

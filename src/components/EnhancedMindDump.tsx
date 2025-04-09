
import { useState } from 'react';
import { Edit, Save, Trash } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';

interface Note {
  id: string;
  content: string;
  date: Date;
}

const EnhancedMindDump = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('clarity-notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const saveNote = () => {
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now().toString(),
      content: newNote,
      date: new Date()
    };
    
    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    localStorage.setItem('clarity-notes', JSON.stringify(updatedNotes));
    setNewNote('');
  };
  
  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('clarity-notes', JSON.stringify(updatedNotes));
    if (editingNoteId === id) {
      setEditingNoteId(null);
    }
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = (id: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, content: editContent } : note
    );
    setNotes(updatedNotes);
    localStorage.setItem('clarity-notes', JSON.stringify(updatedNotes));
    setEditingNoteId(null);
  };

  return (
    <div className="w-full space-y-6">
      <div className="mt-4 mb-6">
        <h2 className="text-xl font-semibold mb-2 text-foreground">Mind Dump</h2>
        <p className="text-sm text-muted-foreground">Capture your thoughts, ideas, and reflections here.</p>
      </div>
      
      <div className="flex flex-col">
        <Textarea 
          placeholder="What's on your mind?"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full min-h-[100px] resize-none bg-card"
        />
        <div className="flex justify-end mt-2">
          <Button 
            onClick={saveNote}
            disabled={!newNote.trim()}
            className="bg-[#64d8a3] hover:bg-[#4cbb8a] text-white"
          >
            Save Note
          </Button>
        </div>
      </div>
      
      {notes.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-8">
          {notes.map(note => (
            <Card key={note.id} className="w-full md:w-[calc(50%-0.5rem)] p-4 zen-card">
              {editingNoteId === note.id ? (
                <>
                  <Textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-h-[100px] resize-none bg-transparent"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingNoteId(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => saveEdit(note.id)}
                      className="bg-[#64d8a3] hover:bg-[#4cbb8a] text-white"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="whitespace-pre-wrap break-words mb-2">
                    {note.content}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-2 border-t border-border/40">
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.date).toLocaleDateString()}
                    </span>
                    <div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => startEditing(note)}
                      >
                        <Edit className="h-4 w-4 text-[#64d8a3]" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
      
      {notes.length === 0 && (
        <div className="w-full py-12 text-center text-muted-foreground">
          <p>No notes yet. Start capturing your thoughts!</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedMindDump;

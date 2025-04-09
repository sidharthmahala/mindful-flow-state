
import { useState } from 'react';
import { Edit, Save, Trash, List, CheckSquare, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Toggle } from './ui/toggle';

type NoteType = 'text' | 'list' | 'checklist';

interface Note {
  id: string;
  title: string;
  content: string;
  date: Date;
  type: NoteType;
  items?: Array<{id: string, text: string, checked?: boolean}>;
}

const EnhancedMindDump = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('clarity-notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  
  const [newNote, setNewNote] = useState<Partial<Note>>({
    title: '',
    content: '',
    type: 'text',
    items: []
  });
  
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState<Partial<Note>>({});
  const [newItemText, setNewItemText] = useState('');

  const saveNote = () => {
    if ((!newNote.title && !newNote.content) || 
        (newNote.type !== 'text' && (!newNote.items || newNote.items.length === 0))) return;
    
    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title || '',
      content: newNote.content || '',
      date: new Date(),
      type: newNote.type || 'text',
      items: newNote.items || []
    };
    
    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('clarity-notes', JSON.stringify(updatedNotes));
    
    // Reset form
    setNewNote({
      title: '',
      content: '',
      type: 'text',
      items: []
    });
    setNewItemText('');
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
    setEditNote({...note});
  };

  const saveEdit = () => {
    if (!editingNoteId || !editNote) return;
    
    const updatedNotes = notes.map(note => 
      note.id === editingNoteId ? {...note, ...editNote} : note
    );
    
    setNotes(updatedNotes);
    localStorage.setItem('clarity-notes', JSON.stringify(updatedNotes));
    setEditingNoteId(null);
    setEditNote({});
  };
  
  const addItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      checked: false
    };
    
    setNewNote(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
    
    setNewItemText('');
  };
  
  const removeItem = (itemId: string) => {
    setNewNote(prev => ({
      ...prev,
      items: (prev.items || []).filter(item => item.id !== itemId)
    }));
  };
  
  const addEditItem = () => {
    if (!newItemText.trim() || !editNote) return;
    
    const newItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      checked: false
    };
    
    setEditNote(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
    
    setNewItemText('');
  };
  
  const removeEditItem = (itemId: string) => {
    setEditNote(prev => ({
      ...prev,
      items: (prev.items || []).filter(item => item.id !== itemId)
    }));
  };
  
  const toggleCheckItem = (itemId: string, checked: boolean) => {
    setNewNote(prev => ({
      ...prev,
      items: (prev.items || []).map(item => 
        item.id === itemId ? {...item, checked} : item
      )
    }));
  };
  
  const toggleEditCheckItem = (itemId: string, checked: boolean) => {
    setEditNote(prev => ({
      ...prev,
      items: (prev.items || []).map(item => 
        item.id === itemId ? {...item, checked} : item
      )
    }));
  };

  return (
    <div className="w-full space-y-6">
      <div className="mt-4 mb-6">
        <h2 className="text-xl font-semibold mb-2 text-foreground">Mind Dump</h2>
        <p className="text-sm text-muted-foreground">Capture your thoughts, ideas, and reflections here.</p>
      </div>
      
      {/* Note Creation Form */}
      <Card className="p-4">
        <div className="flex flex-col space-y-4">
          <Input 
            placeholder="Title (optional)"
            value={newNote.title || ''}
            onChange={(e) => setNewNote({...newNote, title: e.target.value})}
            className="text-lg font-medium border-none px-0 focus-visible:ring-0"
          />
          
          <div className="flex gap-2 mb-2">
            <Toggle 
              pressed={newNote.type === 'text'} 
              onPressedChange={() => setNewNote({...newNote, type: 'text'})}
              className="h-8"
            >
              Text
            </Toggle>
            <Toggle 
              pressed={newNote.type === 'list'} 
              onPressedChange={() => setNewNote({...newNote, type: 'list'})}
              className="h-8"
            >
              <List className="h-4 w-4 mr-1" /> List
            </Toggle>
            <Toggle 
              pressed={newNote.type === 'checklist'} 
              onPressedChange={() => setNewNote({...newNote, type: 'checklist'})}
              className="h-8"
            >
              <CheckSquare className="h-4 w-4 mr-1" /> Checklist
            </Toggle>
          </div>
          
          {newNote.type === 'text' ? (
            <Textarea 
              placeholder="What's on your mind?"
              value={newNote.content || ''}
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              className="min-h-[100px] resize-none bg-transparent border-none px-0 focus-visible:ring-0"
            />
          ) : (
            <div className="space-y-2">
              {(newNote.items || []).map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  {newNote.type === 'checklist' && (
                    <input 
                      type="checkbox" 
                      checked={item.checked} 
                      onChange={(e) => toggleCheckItem(item.id, e.target.checked)}
                      className="h-4 w-4 rounded-sm border-gray-300"
                    />
                  )}
                  <div className="flex-1">{item.text}</div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              <div className="flex items-center gap-2">
                <Input 
                  placeholder={`Add ${newNote.type === 'checklist' ? 'task' : 'item'}...`}
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem()}
                  className="flex-1"
                />
                <Button 
                  size="sm" 
                  onClick={addItem}
                  className="bg-[#64d8a3] hover:bg-[#50c090] text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={saveNote}
            disabled={(newNote.type === 'text' && !newNote.content && !newNote.title) || 
                     ((newNote.type === 'list' || newNote.type === 'checklist') && 
                      (!newNote.items || newNote.items.length === 0))}
            className="bg-[#64d8a3] hover:bg-[#50c090] text-white"
          >
            Save Note
          </Button>
        </div>
      </Card>
      
      {/* Notes Display */}
      {notes.length > 0 ? (
        <div className="flex flex-wrap gap-4 mt-8">
          {notes.map(note => (
            <Card key={note.id} className="w-full md:w-[calc(50%-0.5rem)] p-4">
              {editingNoteId === note.id ? (
                <div className="space-y-4">
                  <Input 
                    value={editNote.title || ''}
                    onChange={(e) => setEditNote({...editNote, title: e.target.value})}
                    className="text-lg font-medium border-none px-0 focus-visible:ring-0"
                    placeholder="Title (optional)"
                  />
                  
                  {note.type === 'text' ? (
                    <Textarea 
                      value={editNote.content || ''}
                      onChange={(e) => setEditNote({...editNote, content: e.target.value})}
                      className="min-h-[100px] resize-none bg-transparent border-none px-0 focus-visible:ring-0"
                    />
                  ) : (
                    <div className="space-y-2">
                      {(editNote.items || []).map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          {note.type === 'checklist' && (
                            <input 
                              type="checkbox" 
                              checked={item.checked} 
                              onChange={(e) => toggleEditCheckItem(item.id, e.target.checked)}
                              className="h-4 w-4 rounded-sm border-gray-300"
                            />
                          )}
                          <div className="flex-1">{item.text}</div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => removeEditItem(item.id)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      
                      <div className="flex items-center gap-2">
                        <Input 
                          placeholder={`Add ${note.type === 'checklist' ? 'task' : 'item'}...`}
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addEditItem()}
                          className="flex-1"
                        />
                        <Button 
                          size="sm" 
                          onClick={addEditItem}
                          className="bg-[#64d8a3] hover:bg-[#50c090] text-white"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditingNoteId(null);
                        setEditNote({});
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={saveEdit}
                      className="bg-[#64d8a3] hover:bg-[#50c090] text-white"
                    >
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {note.title && (
                    <h3 className="text-lg font-medium mb-2">{note.title}</h3>
                  )}
                  
                  {note.type === 'text' ? (
                    <div className="whitespace-pre-wrap break-words mb-4">
                      {note.content}
                    </div>
                  ) : (
                    <div className="space-y-1 mb-4">
                      {(note.items || []).map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          {note.type === 'checklist' && (
                            <input 
                              type="checkbox" 
                              checked={item.checked} 
                              readOnly
                              className="h-4 w-4 rounded-sm border-gray-300 cursor-default"
                            />
                          )}
                          <div className={`flex-1 ${note.type === 'checklist' && item.checked ? 'line-through text-muted-foreground' : ''}`}>
                            {item.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-4 pt-2 border-t border-border/40">
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.date).toLocaleDateString()} 
                      {note.type !== 'text' && (
                        <span className="ml-2">
                          {note.type === 'checklist' ? 
                            `${(note.items || []).filter(i => i.checked).length}/${(note.items || []).length} complete` : 
                            `${(note.items || []).length} items`}
                        </span>
                      )}
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
      ) : (
        <div className="w-full py-12 text-center text-muted-foreground">
          <p>No notes yet. Start capturing your thoughts!</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedMindDump;

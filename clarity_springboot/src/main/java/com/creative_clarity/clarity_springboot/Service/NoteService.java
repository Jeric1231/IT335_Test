package com.creative_clarity.clarity_springboot.Service;

import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.creative_clarity.clarity_springboot.Entity.NoteEntity;
import com.creative_clarity.clarity_springboot.Repository.NoteRepository;


@Service
public class NoteService {
	
	@Autowired
	NoteRepository nrepo;

	public NoteService() {
		super();
	}
	
	//Create of CRUD
	public NoteEntity postNoteRecord(NoteEntity note) {
		return nrepo.save(note);
	}
	
	//Read of CRUD
	public List<NoteEntity> getNotesByUserId(int userId){
    return nrepo.findByUserId(userId);
  }

	public List<NoteEntity> getAllNotes() {

		return nrepo.findAll();

}
	
	//Update of CRUD
	
	public NoteEntity putNoteDetails (int noteId, NoteEntity newNoteDetails) {
		NoteEntity note = nrepo.findById(noteId)
		.orElseThrow(() -> new NoSuchElementException("Note " + noteId + " not found"));
		
		note.setTitle(newNoteDetails.getTitle());
		note.setContent(newNoteDetails.getContent());
		note.setSubject(newNoteDetails.getSubject());
		note.setLastModified(new Date());
		
		return nrepo.save(note);
	}
	
	//Delete of CRUD
	public String deleteNote(int noteId) {
		if(nrepo.existsById(noteId)) {
			nrepo.deleteById(noteId);
			return "Note record successfully deleted!";
		} else {
			return "Note ID " + noteId + " NOT FOUND!";
		}
  	}
}
package com.creative_clarity.clarity_springboot.Controller;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.creative_clarity.clarity_springboot.Entity.NoteEntity;
import com.creative_clarity.clarity_springboot.Service.NoteService;

@RestController
@RequestMapping(method = RequestMethod.GET,path="/api/note")
public class NoteController {
	@Autowired
	NoteService nserv;

	// Get notes for a specific user
  @GetMapping("/getusernotes")
  public List<NoteEntity> getUserNotes(@RequestParam int userId) {
    return nserv.getNotesByUserId(userId);
  }
	
	// Create note
  @PostMapping("/postnoterecord")
  public NoteEntity postNoteRecord(@RequestBody NoteEntity note) {
    // Ensure created_at and lastModified are set
    if (note.getCreated_at() == null) {
      note.setCreated_at(new Date());
    }
    if (note.getLastModified() == null) {
      note.setLastModified(new Date());
    }
    return nserv.postNoteRecord(note);
  }

	//Read of CRUD
	@GetMapping("/getallnote")
	public List<NoteEntity> getAllNotes(){
		return nserv.getAllNotes();
	}
		
	//Update of CRUD
	@PutMapping("/putnotedetails")
	public NoteEntity putNoteDetails(@RequestParam int noteId, @RequestBody NoteEntity newNoteDetails) {
		return nserv.putNoteDetails(noteId, newNoteDetails);
	}
		
	//Delete of CRUD
	@DeleteMapping("/deletenotedetails/{noteId}")
	public String deleteNote(@PathVariable int noteId) {
		return nserv.deleteNote(noteId);
	}
}
package com.creative_clarity.clarity_springboot.Entity;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class NoteEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int noteId;
	
	private int userId;
	private String title;
	private String content;
	private String subject;
	private Date created_at;
	private Date lastModified;
	
	public NoteEntity() {
		
	}

	public NoteEntity(int userId, String title, String content, String subject, Date created_at, Date lastModified) {
    this.userId = userId;
    this.title = title;
    this.content = content;
    this.subject = subject;
    this.created_at = created_at;
    this.lastModified = lastModified;
  }

	public int getUserId() {
    return userId;
  }

  public void setUserId(int userId) {
    this.userId = userId;
  }

	public String getSubject() {
    return subject;
  }

	public Date getLastModified() {
    return lastModified;
  }

  public void setLastModified(Date lastModified) {
    this.lastModified = lastModified;
  }

  public void setSubject(String subject) {
    this.subject = subject;
  }

	public int getNoteId() {
		return noteId;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public Date getCreated_at() {
		return created_at;
	}

	public void setCreated_at(Date created_at) {
		this.created_at = created_at;
	}
	
}
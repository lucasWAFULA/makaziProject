/**
 * PropertyMediaUpload
 * Drag-and-drop image + video upload panel for agents/hosts.
 * Works on an EXISTING property (needs property.id).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../api/client'

const MAX_IMAGE_MB = 10
const MAX_VIDEO_MB = 100
const ACCEPTED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ACCEPTED_VIDEOS = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo']

function humanSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ width: 16, height: 16 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

/**
 * @param {{ propertyId: number|string, onUpdate?: () => void }} props
 */
export function PropertyMediaUpload({ propertyId, onUpdate }) {
  const [images, setImages] = useState([])
  const [videos, setVideos] = useState([])
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [error, setError] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [savingUrl, setSavingUrl] = useState(false)
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)

  // ── Fetch existing media ───────────────────────────────────────────────────
  const fetchMedia = useCallback(async () => {
    if (!propertyId) return
    try {
      const [imgRes, vidRes] = await Promise.all([
        api.get(`properties/${propertyId}/images/`),
        api.get(`properties/${propertyId}/videos/`),
      ])
      setImages(Array.isArray(imgRes.data) ? imgRes.data : [])
      setVideos(Array.isArray(vidRes.data) ? vidRes.data : [])
    } catch (_) {}
  }, [propertyId])

  useEffect(() => { fetchMedia() }, [fetchMedia])

  // ── Image upload ───────────────────────────────────────────────────────────
  const uploadImages = useCallback(async (files) => {
    setError('')
    const valid = Array.from(files).filter((f) => {
      if (!ACCEPTED_IMAGES.includes(f.type)) { setError(`${f.name} is not a supported image format.`); return false }
      if (f.size > MAX_IMAGE_MB * 1024 * 1024) { setError(`${f.name} exceeds ${MAX_IMAGE_MB} MB.`); return false }
      return true
    })
    if (!valid.length) return
    setUploading(true)

    for (const file of valid) {
      const formData = new FormData()
      formData.append('images', file)
      const key = file.name + Date.now()
      setUploadProgress((prev) => ({ ...prev, [key]: 0 }))
      try {
        await api.post(`properties/${propertyId}/images/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const pct = Math.round((e.loaded / e.total) * 100)
            setUploadProgress((prev) => ({ ...prev, [key]: pct }))
          },
        })
      } catch (err) {
        setError(err.response?.data?.detail || `Failed to upload ${file.name}`)
      }
      setUploadProgress((prev) => { const n = { ...prev }; delete n[key]; return n })
    }

    setUploading(false)
    await fetchMedia()
    onUpdate?.()
  }, [propertyId, fetchMedia, onUpdate])

  // ── Image delete ───────────────────────────────────────────────────────────
  const deleteImage = useCallback(async (imgId) => {
    if (!window.confirm('Remove this photo?')) return
    try {
      await api.delete(`properties/images/${imgId}/`)
      setImages((prev) => prev.filter((i) => i.id !== imgId))
      onUpdate?.()
    } catch (_) { setError('Could not delete image.') }
  }, [onUpdate])

  // ── Video file upload ──────────────────────────────────────────────────────
  const uploadVideo = useCallback(async (file) => {
    if (!ACCEPTED_VIDEOS.includes(file.type)) { setError('Unsupported video format (use MP4, MOV, WebM).'); return }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) { setError(`Video exceeds ${MAX_VIDEO_MB} MB.`); return }
    setUploading(true)
    const formData = new FormData()
    formData.append('video', file)
    formData.append('title', file.name.replace(/\.\w+$/, ''))
    try {
      await api.post(`properties/${propertyId}/videos/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await fetchMedia()
      onUpdate?.()
    } catch (err) {
      setError(err.response?.data?.detail || 'Video upload failed.')
    }
    setUploading(false)
  }, [propertyId, fetchMedia, onUpdate])

  // ── Video URL save ─────────────────────────────────────────────────────────
  const saveVideoUrl = useCallback(async () => {
    if (!videoUrl.trim()) return
    setSavingUrl(true)
    try {
      await api.post(`properties/${propertyId}/videos/`, {
        external_url: videoUrl.trim(),
        title: videoTitle.trim() || 'Walkthrough video',
      })
      setVideoUrl('')
      setVideoTitle('')
      await fetchMedia()
      onUpdate?.()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save video link.')
    }
    setSavingUrl(false)
  }, [propertyId, videoUrl, videoTitle, fetchMedia, onUpdate])

  // ── Video delete ───────────────────────────────────────────────────────────
  const deleteVideo = useCallback(async (vidId) => {
    if (!window.confirm('Remove this video?')) return
    try {
      await api.delete(`properties/videos/${vidId}/`)
      setVideos((prev) => prev.filter((v) => v.id !== vidId))
    } catch (_) { setError('Could not delete video.') }
  }, [])

  // ── Drag events ────────────────────────────────────────────────────────────
  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    uploadImages(e.dataTransfer.files)
  }

  const activeProgress = Object.values(uploadProgress)
  const isUploading = uploading || activeProgress.length > 0

  return (
    <div className="media-upload-panel">
      {/* ── Images ── */}
      <div className="media-section">
        <div className="media-section-header">
          <h3>📸 Photos</h3>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => imageInputRef.current?.click()} disabled={isUploading}>
            + Add photos
          </button>
        </div>
        <small className="media-hint">Up to {MAX_IMAGE_MB} MB per photo · JPG, PNG, WebP supported · First photo is the cover</small>

        {/* Drop zone */}
        <div
          className={`media-dropzone ${dragging ? 'is-dragging' : ''} ${isUploading ? 'is-uploading' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !isUploading && imageInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && imageInputRef.current?.click()}
          aria-label="Upload photos — drag and drop or click"
        >
          <UploadIcon />
          <span>{dragging ? 'Drop to upload' : isUploading ? 'Uploading…' : 'Drag photos here or click to browse'}</span>
          {isUploading && (
            <div className="upload-progress-bar">
              <span style={{ width: `${activeProgress[0] || 50}%` }} />
            </div>
          )}
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept={ACCEPTED_IMAGES.join(',')}
          multiple
          style={{ display: 'none' }}
          onChange={(e) => uploadImages(e.target.files)}
        />

        {/* Image grid */}
        {images.length > 0 && (
          <div className="media-image-grid">
            {images.map((img, idx) => (
              <div key={img.id} className={`media-thumb ${idx === 0 ? 'is-cover' : ''}`}>
                <img src={img.url} alt={`Photo ${idx + 1}`} loading="lazy" />
                {idx === 0 && <span className="media-cover-badge">Cover</span>}
                <button
                  type="button"
                  className="media-thumb-delete"
                  onClick={() => deleteImage(img.id)}
                  aria-label="Remove photo"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}
        {images.length === 0 && !isUploading && (
          <p className="media-empty">No photos yet — add at least 3 for best results.</p>
        )}
      </div>

      {/* ── Videos ── */}
      <div className="media-section">
        <h3>🎬 Videos &amp; Walkthrough</h3>
        <small className="media-hint">Upload a short video (MP4/MOV, max {MAX_VIDEO_MB} MB) or paste a YouTube/Google Drive link.</small>

        <div className="media-video-row">
          {/* URL input */}
          <div className="media-video-url-group">
            <input
              type="url"
              className="media-video-url-input"
              placeholder="YouTube, Google Drive or Dropbox link…"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <input
              type="text"
              className="media-video-title-input"
              placeholder="Label (e.g. Full walkthrough)"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={saveVideoUrl}
              disabled={!videoUrl.trim() || savingUrl}
            >
              {savingUrl ? 'Saving…' : 'Add link'}
            </button>
          </div>

          <div className="media-or-divider"><span>or</span></div>

          {/* File upload */}
          <button
            type="button"
            className="btn btn-secondary btn-sm media-video-upload-btn"
            onClick={() => videoInputRef.current?.click()}
            disabled={isUploading}
          >
            📁 Upload video file
          </button>
          <input
            ref={videoInputRef}
            type="file"
            accept={ACCEPTED_VIDEOS.join(',')}
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && uploadVideo(e.target.files[0])}
          />
        </div>

        {/* Video list */}
        {videos.length > 0 && (
          <div className="media-video-list">
            {videos.map((v) => (
              <div key={v.id} className="media-video-item">
                <span className="media-video-icon">🎬</span>
                <div className="media-video-info">
                  <strong>{v.title || 'Video'}</strong>
                  <small>
                    {v.video_url ? (
                      <a href={v.video_url} target="_blank" rel="noreferrer">{v.video_url.length > 55 ? v.video_url.slice(0, 55) + '…' : v.video_url}</a>
                    ) : '—'}
                  </small>
                </div>
                <button type="button" className="media-video-delete" onClick={() => deleteVideo(v.id)} aria-label="Remove video">
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="media-error">⚠️ {error} <button type="button" onClick={() => setError('')}>✕</button></p>}
    </div>
  )
}
